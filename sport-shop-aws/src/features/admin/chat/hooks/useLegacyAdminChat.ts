import { useState, useEffect, useRef } from "react";
import { chatRoomApi, chatApi } from "@/legacy-chat/api/legacy-chat-api";
import ws from "@/legacy-chat/websocket/ws";

interface Room {
  id: number;
  customerName?: string;
  adminName?: string;
  lastMessageAt?: string;
  hasUnread?: boolean;
}

interface Message {
  messageId: number;
  senderId: number;
  content?: string;
  fileUrl?: string;
  contentType?: string;
  sentAt: string;
  isMine: boolean;
}

export function useLegacyAdminChat() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const subscriptionRef = useRef<any>(null);
  const newRoomSubRef = useRef<any>(null);
  const selectedRoomRef = useRef<number | null>(null);

  const getLastReadKey = (uid: number, roomId: number) =>
    `admin_last_read_${uid}_${roomId}`;

  // Lấy adminId từ sessionStorage
  useEffect(() => {
    const uid = sessionStorage.getItem("userId");
    if (uid) setAdminId(Number(uid));
  }, []);

  useEffect(() => {
    selectedRoomRef.current = selectedRoomId;
  }, [selectedRoomId]);

  // Load rooms và tính toán hasUnread
  const loadRooms = async () => {
    if (!adminId) return;
    try {
      const res = await chatRoomApi.getAdminRooms();
      setRooms(() => {
        const list = res.data.map((r: any) => {
          let hasUnread = false;

          if (adminId) {
            const key = getLastReadKey(adminId, r.id);
            const stored = localStorage.getItem(key);

            if (r.lastMessageAt) {
              if (!stored) {
                // Lần đầu chưa có dữ liệu -> coi như chưa đọc
                hasUnread = true;
              } else {
                try {
                  const lastRead = new Date(stored);
                  const lastMsg = new Date(r.lastMessageAt);
                  if (lastMsg > lastRead) {
                    hasUnread = true;
                  }
                } catch {
                  hasUnread = true;
                }
              }
            }
          }

          // Phòng đang mở thì không hiển thị unread
          if (r.id === selectedRoomRef.current) {
            hasUnread = false;
          }

          return { ...r, hasUnread };
        });

        // Sắp xếp theo lastMessageAt (mới nhất lên đầu)
        list.sort((a: Room, b: Room) => {
          if (!a.lastMessageAt && !b.lastMessageAt) return 0;
          if (!a.lastMessageAt) return 1;
          if (!b.lastMessageAt) return -1;
          return new Date(b.lastMessageAt!).getTime() - new Date(a.lastMessageAt!).getTime();
        });

        return list;
      });
    } catch (err) {
      console.error("loadRooms error:", err);
    }
  };

  // Load rooms lần đầu + polling mỗi 5 giây
  useEffect(() => {
    if (!adminId) return;
    loadRooms();
    const interval = setInterval(() => loadRooms(), 5000);
    return () => clearInterval(interval);
  }, [adminId]);

  // WebSocket: lắng nghe room mới (chỉ setup 1 lần, không cleanup khi re-render)
  useEffect(() => {
    if (!adminId) return;

    ws.connect(
      () => {
        if (!newRoomSubRef.current) {
          newRoomSubRef.current = ws.subscribeNewRoom((room: any) => {
            setRooms((old) => {
              const exists = old.find((r) => r.id === room.id);
              if (exists) return old;

              let hasUnread = true;
              const key = getLastReadKey(adminId, room.id);
              const stored = localStorage.getItem(key);
              if (stored && room.lastMessageAt) {
                try {
                  if (new Date(room.lastMessageAt) <= new Date(stored)) {
                    hasUnread = false;
                  }
                } catch {
                  /* ignore */
                }
              }

              const updated = [{ ...room, hasUnread }, ...old];

              updated.sort((a: Room, b: Room) => {
                if (!a.lastMessageAt && !b.lastMessageAt) return 0;
                if (!a.lastMessageAt) return 1;
                if (!b.lastMessageAt) return -1;
                return new Date(b.lastMessageAt!).getTime() - new Date(a.lastMessageAt!).getTime();
              });

              return updated;
            });
          });
        }
      },
      (err: any) => {
        console.error("WS connect error:", err);
      }
    );

    // KHÔNG cleanup subscription ở đây vì nó cần tồn tại suốt lifecycle của component
    // Chỉ cleanup khi component thực sự unmount (không có dependency array hoặc empty array)
  }, [adminId]);

  // Load messages khi chọn room
  const loadMessages = async (roomId: number) => {
    const res = await chatApi.getMessages(roomId);
    const mapped = res.data.map((m: any) => ({
      ...m,
      isMine: m.senderId === adminId,
    }));
    setMessages(mapped);
    return mapped;
  };

  // Callback xử lý tin nhắn mới (giống CustomerChat - định nghĩa một lần)
  const onMessage = (msg: any) => {
    const currentRoomId = selectedRoomRef.current;
    if (!currentRoomId || !adminId) return;

    // Chỉ xử lý nếu tin nhắn thuộc room đang được chọn
    // (WebSocket có thể gửi message của room khác nếu subscription chưa được cleanup kịp)
    
    const newMessage: Message = { ...msg, isMine: msg.senderId === adminId };
    
    // Kiểm tra xem tin nhắn đã tồn tại chưa (tránh duplicate từ WebSocket)
    setMessages((old) => {
      // Kiểm tra xem đã có message với cùng messageId chưa
      const existingIndex = old.findIndex((m) => m.messageId === msg.messageId);
      if (existingIndex !== -1) {
        // Đã có rồi, không thêm nữa (tránh duplicate)
        return old;
      }
      
      // Tin nhắn mới, thêm vào (giống CustomerChat - đơn giản)
      return [...old, newMessage];
    });

    // Đang xem phòng này -> coi như đã đọc
    if (adminId && msg.sentAt && currentRoomId) {
      const key = getLastReadKey(adminId, currentRoomId);
      localStorage.setItem(key, msg.sentAt);
    }

    // Cập nhật lastMessageAt + đẩy room lên đầu
    if (currentRoomId) {
      setRooms((oldRooms) => {
        const updated = oldRooms.map((r) =>
          r.id === currentRoomId
            ? { ...r, lastMessageAt: msg.sentAt, hasUnread: false }
            : r
        );

        updated.sort((a: Room, b: Room) => {
          if (!a.lastMessageAt && !b.lastMessageAt) return 0;
          if (!a.lastMessageAt) return 1;
          if (!b.lastMessageAt) return -1;
          return new Date(b.lastMessageAt!).getTime() - new Date(a.lastMessageAt!).getTime();
        });

        return updated;
      });
    }
  };

  // Chọn room và subscribe WebSocket (giống logic CustomerChat)
  const selectRoom = async (roomId: number) => {
    setSelectedRoomId(roomId);

    // Clear unread cho room vừa click
    setRooms((oldRooms) =>
      oldRooms.map((r) => (r.id === roomId ? { ...r, hasUnread: false } : r))
    );

    // Load messages
    const msgs = await loadMessages(roomId);
    const lastMsg = msgs[msgs.length - 1];
    if (adminId && lastMsg && lastMsg.sentAt) {
      const key = getLastReadKey(adminId, roomId);
      localStorage.setItem(key, lastMsg.sentAt);
    }

    // Connect WebSocket và subscribe (giống CustomerChat)
    // Logic giống hệt CustomerChat: connectWsForRoom
    const connectWsForRoom = (rid: number) => {
      const isWsConnected = (ws as any).connected;
      
      if (!isWsConnected) {
        // Chưa connected: connect trước
        ws.connect(
          () => {
            // Đã connected, unsubscribeAll và subscribe vào room
            if (selectedRoomRef.current === rid) {
              if ((ws as any).unsubscribeAll) {
                (ws as any).unsubscribeAll();
              }
              const sub = ws.subscribeRoom(rid, onMessage);
              if (sub) {
                subscriptionRef.current = sub;
              }
            }
          },
          (err: any) => {
            console.error("[WS] Connection error:", err);
          }
        );
      } else {
        // Đã connected: unsubscribeAll và subscribe ngay
        if ((ws as any).unsubscribeAll) {
          (ws as any).unsubscribeAll();
        }
        const sub = ws.subscribeRoom(rid, onMessage);
        if (sub) {
          subscriptionRef.current = sub;
        }
      }
    };

    connectWsForRoom(roomId);
  };

  // Gửi tin nhắn (KHÔNG dùng optimistic update - giống CustomerChat)
  const sendMessage = async () => {
    if (!selectedRoomId || !adminId) return;

    const now = new Date().toISOString();

    // TEXT ONLY
    if (text.trim().length > 0 && !pendingFile) {
      const messageText = text.trim();

      // Gửi qua WebSocket (message sẽ được thêm vào state qua onMessage callback)
      ws.sendMessage(selectedRoomId, {
        content: messageText,
        fileUrl: null,
        contentType: "TEXT",
      });
      setText("");

      if (adminId) {
        const key = getLastReadKey(adminId, selectedRoomId);
        localStorage.setItem(key, now);
      }

      return;
    }

    // FILE ONLY
    if (pendingFile) {
      try {
        const res = await chatApi.uploadFile(pendingFile);
        const { url, contentType } = res.data;

        // Gửi qua WebSocket (message sẽ được thêm vào state qua onMessage callback)
        ws.sendMessage(selectedRoomId, {
          content: null,
          fileUrl: url,
          contentType,
        });

        setPendingFile(null);

        if (adminId) {
          const key = getLastReadKey(adminId, selectedRoomId);
          localStorage.setItem(key, now);
        }
      } catch (err) {
        console.error("uploadFile error:", err);
        alert("Cannot upload file");
      }
    }
  };

  // Xử lý chọn file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    e.target.value = "";
  };

  return {
    rooms,
    selectedRoomId,
    setSelectedRoomId,
    selectRoom,
    messages,
    text,
    setText,
    pendingFile,
    setPendingFile,
    previewImage,
    setPreviewImage,
    sendMessage,
    handleFileChange,
  };
}

