// src/legacy-chat/pages/CustomerChat.jsx
import React, { useEffect, useRef, useState } from "react";
import { chatRoomApi, chatApi } from "../api/legacy-chat-api";
import ws from "../websocket/ws";
import ChatWidget from "../components/ChatWidget";
import ChatBox from "../components/ChatBox";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

export default function CustomerChat() {
  const { accessToken, user } = useAuthStore();
  const [showChat, setShowChat] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const chatOpenRef = useRef(false);
  const roomIdRef = useRef(null);
  const userIdRef = useRef(null);

  const getLastReadKey = (uid, rid) => `customer_last_read_${uid}_${rid}`;

  // Lấy userId từ sessionStorage (login)
  useEffect(() => {
    const uid = sessionStorage.getItem("userId");
    if (uid) {
      const num = Number(uid);
      setUserId(num);
      userIdRef.current = num;
    }
  }, []);

  // Đồng bộ ref để biết chat đang mở hay đóng
  useEffect(() => {
    chatOpenRef.current = showChat;
  }, [showChat]);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  // Khi có userId → kiểm tra room có sẵn + tính unread dựa trên lastMessageAt & localStorage
  useEffect(() => {
    const init = async () => {
      if (!userIdRef.current) return;

      try {
        const res = await chatRoomApi.getMyRooms();
        if (res.data && res.data.length > 0) {
          // hiện tại mỗi customer chỉ dùng 1 phòng → lấy phòng đầu
          const r = res.data[0];

          setRoomId(r.id);
          roomIdRef.current = r.id;

          sessionStorage.setItem(
            `customerRoomId_${userIdRef.current}`,
            String(r.id)
          );

          let unread = false;
          if (r.lastMessageAt) {
            const key = getLastReadKey(userIdRef.current, r.id);
            const stored = localStorage.getItem(key);
            if (!stored) {
              unread = true;
            } else {
              try {
                const lastRead = new Date(stored);
                const lastMsg = new Date(r.lastMessageAt);
                if (lastMsg > lastRead) {
                  unread = true;
                }
              } catch {
                unread = true;
              }
            }
          }

          setHasUnread(unread);
        }
      } catch (err) {
        console.error("init customer chat error:", err);
      }
    };

    if (userId) {
      init();
    }
  }, [userId]);

  const onMessage = (msg) => {
    // Normalize senderId để so sánh (có thể là string hoặc number)
    const currentUserId = userIdRef.current;
    const msgSenderId = msg.senderId != null ? Number(msg.senderId) : null;
    const isMine = currentUserId != null && msgSenderId !== null && msgSenderId === currentUserId;

    // Debug log (có thể xóa sau)
    if (process.env.NODE_ENV === 'development') {
      console.log('[CustomerChat] onMessage:', {
        msgSenderId,
        currentUserId,
        isMine,
        msgContent: msg.content?.substring(0, 20),
      });
    }

    setMessages((old) => [
      ...old,
      {
        ...msg,
        isMine,
      },
    ]);

    // nếu chat đang đóng → chỉ bật red dot, KHÔNG cập nhật last_read
    if (!chatOpenRef.current) {
      setHasUnread(true);
    } else {
      // đang mở chat → coi như đọc luôn
      if (userIdRef.current && roomIdRef.current && msg.sentAt) {
        const key = getLastReadKey(userIdRef.current, roomIdRef.current);
        localStorage.setItem(key, msg.sentAt);
      }
    }
  };

  const loadMessages = async (rid) => {
    try {
      const res = await chatApi.getMessages(rid);
      const currentUserId = userIdRef.current;
      
      const mapped = res.data.map((m) => {
        // Normalize senderId để so sánh (có thể là string hoặc number)
        const msgSenderId = m.senderId != null ? Number(m.senderId) : null;
        const isMine = currentUserId != null && msgSenderId !== null && msgSenderId === currentUserId;
        
        // Debug log (có thể xóa sau)
        if (process.env.NODE_ENV === 'development' && res.data.length > 0) {
          console.log('[CustomerChat] loadMessages:', {
            msgSenderId,
            currentUserId,
            isMine,
            totalMessages: res.data.length,
          });
        }
        
        return {
          ...m,
          isMine,
        };
      });
      
      setMessages(mapped);
      return mapped;
    } catch (err) {
      const status = err.response?.status;
      // BE hiện tại trả 403 khi room không tồn tại
      if (status === 403 || status === 404) {
        throw new Error("ROOM_NOT_FOUND");
      }
      throw err;
    }
  };

  const connectWsForRoom = (rid) => {
    if (!wsConnected) {
      ws.connect(
        () => {
          setWsConnected(true);
          // đảm bảo chỉ nghe 1 room
          if (ws.unsubscribeAll) {
            ws.unsubscribeAll();
          }
          ws.subscribeRoom(rid, onMessage);
        },
        (err) => {
          console.error("WS connect error:", err);
        }
      );
    } else {
      if (ws.unsubscribeAll) {
        ws.unsubscribeAll();
      }
      ws.subscribeRoom(rid, onMessage);
    }
  };

  const ensureRoomAndConnect = async () => {
    const currentUserId = userIdRef.current;
    const storageKey =
      currentUserId != null ? `customerRoomId_${currentUserId}` : null;

    try {
      let rid = roomIdRef.current;

      // 1. Lấy roomId từ sessionStorage nếu chưa có trong state
      if (!rid && storageKey) {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          rid = Number(saved);
        }
      }

      let msgs = [];

      // 2. Nếu có roomId cũ → thử load message
      if (rid) {
        try {
          msgs = await loadMessages(rid);
        } catch (e) {
          if (e.message === "ROOM_NOT_FOUND") {
            // roomId cũ không còn trong DB → xoá và tạo mới
            rid = null;
            setRoomId(null);
            roomIdRef.current = null;
            if (storageKey) {
              sessionStorage.removeItem(storageKey);
            }
          } else {
            throw e;
          }
        }
      }

      // 3. Nếu sau bước trên vẫn chưa có roomId → tạo phòng mới
      if (!rid) {
        const res = await chatRoomApi.createRoom({ adminId: 1 });
        rid = res.data.id;

        if (storageKey) {
          sessionStorage.setItem(storageKey, String(rid));
        }

        msgs = await loadMessages(rid); // phòng mới, có thể chưa có tin nhắn nào
      }

      // 4. Cập nhật state & last_read
      setRoomId(rid);
      roomIdRef.current = rid;

      if (currentUserId && msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.sentAt) {
          const key = getLastReadKey(currentUserId, rid);
          localStorage.setItem(key, lastMsg.sentAt);
        }
      }

      setHasUnread(false);
      connectWsForRoom(rid);
    } catch (err) {
      console.error(err);
      // Kiểm tra nếu là lỗi authentication
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        toast.info("Vui lòng đăng nhập để được nhận tư vấn");
        setShowChat(false);
      } else {
        toast.error("Không thể kết nối chat. Vui lòng thử lại sau.");
        setShowChat(false);
      }
    }
  };

  // TEXT từ ChatBox
  const sendMessage = (text) => {
    if (!roomIdRef.current) return;
    if (!text || !text.trim()) return;

    ws.sendMessage(roomIdRef.current, {
      content: text,
      fileUrl: null,
      contentType: "TEXT",
    });

    // tin mình gửi ra cũng nên xử là đã đọc
    if (userIdRef.current) {
      const key = getLastReadKey(userIdRef.current, roomIdRef.current);
      localStorage.setItem(key, new Date().toISOString());
    }
  };

  // Gửi file (ảnh/video/tài liệu)
  const sendFile = async (file) => {
    if (!roomIdRef.current || !file) return;

    try {
      const res = await chatApi.uploadFile(file);
      const { url, contentType } = res.data;

      ws.sendMessage(roomIdRef.current, {
        content: null,
        fileUrl: url,
        contentType,
      });

      if (userIdRef.current) {
        const key = getLastReadKey(userIdRef.current, roomIdRef.current);
        localStorage.setItem(key, new Date().toISOString());
      }
    } catch (err) {
      console.error(err);
      alert("Cannot upload file");
    }
  };

  const openChat = async () => {
    // Kiểm tra đăng nhập trước khi mở chat
    const isLoggedIn = accessToken && user;
    const hasUserId = userIdRef.current != null;
    
    if (!isLoggedIn && !hasUserId) {
      toast.info("Vui lòng đăng nhập để được nhận tư vấn");
      return;
    }
    
    setShowChat(true);
    await ensureRoomAndConnect();
  };

  const closeChat = () => {
    setShowChat(false);
    // không disconnect websocket → tiếp tục nhận tin & bật red dot nếu có
  };

  return (
    <>
      <ChatWidget onOpen={openChat} hasUnread={hasUnread} />

      {showChat && (
        <ChatBox
          messages={messages}
          onSend={sendMessage}
          onSendFile={sendFile}
          onClose={closeChat}
        />
      )}
    </>
  );
}
