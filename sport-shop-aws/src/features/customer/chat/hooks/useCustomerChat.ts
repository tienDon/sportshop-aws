import { useState, useEffect, useRef } from "react";
import { chatRoomApi, chatApi } from "@/services/chat.service";
import type { ChatMessage } from "@/services/chat.service";
import ws from "@/services/ws.service";
import { useAuthStore } from "@/store/useAuthStore";

export function useCustomerChat() {
  const { user } = useAuthStore();

  console.log("🔍 [Customer] useCustomerChat hook - user from store:", user);
  console.log("🔍 [Customer] user?.id:", user?.id);
  console.log("🔍 [Customer] Full user object:", JSON.stringify(user, null, 2));

  const [showChat, setShowChat] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [hasUnread, setHasUnread] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const chatOpenRef = useRef(false);
  const roomIdRef = useRef<number | null>(null);
  const userIdRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getLastReadKey = (uid: number, rid: number) =>
    `customer_last_read_${uid}_${rid}`;

  // Sync userIdRef
  useEffect(() => {
    console.log(
      "🔄 [Customer] Syncing userIdRef. user:",
      user,
      "user?.id:",
      user?.id
    );
    if (user?.id) {
      userIdRef.current = Number(user.id);
      console.log("✅ [Customer] userIdRef set to:", userIdRef.current);
    } else {
      userIdRef.current = null;
      console.log("⚠️ [Customer] userIdRef set to null (no user)");
    }
  }, [user]);

  // Sync chatOpenRef
  useEffect(() => {
    chatOpenRef.current = showChat;
  }, [showChat]);

  // Sync roomIdRef
  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  // Scroll to bottom
  useEffect(() => {
    if (showChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showChat]);

  // Init logic (check room, unread)
  useEffect(() => {
    const init = async () => {
      if (!userIdRef.current) return;

      try {
        console.log(
          "🚀 [Customer] Initializing chat for user:",
          userIdRef.current
        );
        const res = await chatRoomApi.getMyRooms();
        console.log("📦 [Customer] getMyRooms response:", res.data);

        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const r = res.data[0];
          setRoomId(r.id);
          roomIdRef.current = r.id;
          console.log("✅ [Customer] Room found and set:", r.id);

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
          console.log("🔔 [Customer] hasUnread:", unread);
        } else {
          console.log("ℹ️ [Customer] No existing rooms found");
        }
      } catch (err) {
        console.error("❌ [Customer] init customer chat error:", err);
      }
    };

    if (user?.id) {
      init();
    }
  }, [user]);

  const onMessage = (msg: any) => {
    console.log("📩 Received WS message:", msg);
    setMessages((old) => {
      const newMsg = {
        ...msg,
        isMine: msg.senderId === userIdRef.current,
      };
      console.log("✨ Adding message to state:", newMsg);
      return [...old, newMsg];
    });

    if (!chatOpenRef.current) {
      setHasUnread(true);
    } else {
      if (userIdRef.current && roomIdRef.current && msg.sentAt) {
        const key = getLastReadKey(userIdRef.current, roomIdRef.current);
        localStorage.setItem(key, msg.sentAt);
      }
    }
  };

  const loadMessages = async (rid: number) => {
    try {
      console.log(`🔄 [Customer] Fetching messages for room ${rid}...`);
      const res = await chatApi.getMessages(rid);
      console.log(`✅ [Customer] Messages fetched for room ${rid}:`, res.data);
      const mapped = res.data.map((m) => ({
        ...m,
        isMine: m.senderId === userIdRef.current,
      }));
      console.log("✨ [Customer] Mapped messages with isMine:", mapped);
      setMessages(mapped);
      return mapped;
    } catch (err: any) {
      console.error("❌ [Customer] loadMessages error:", err);
      const status = err.response?.status;
      if (status === 403 || status === 404) {
        throw new Error("ROOM_NOT_FOUND");
      }
      throw err;
    }
  };

  const connectWsForRoom = (rid: number) => {
    console.log(
      "🔌 [Customer] connectWsForRoom called for room:",
      rid,
      "wsConnected:",
      wsConnected
    );
    if (!wsConnected) {
      ws.connect(
        () => {
          console.log("✅ [Customer] WebSocket connected successfully");
          setWsConnected(true);
          if (ws.unsubscribeAll) {
            ws.unsubscribeAll();
          }
          console.log("📡 [Customer] Subscribing to room:", rid);
          ws.subscribeRoom(rid, onMessage);
        },
        (err) => {
          console.error("❌ [Customer] WS connect error:", err);
        }
      );
    } else {
      console.log(
        "♻️ [Customer] Already connected, resubscribing to room:",
        rid
      );
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

    console.log(
      "🔧 [Customer] ensureRoomAndConnect started. userId:",
      currentUserId
    );

    try {
      let rid = roomIdRef.current;
      console.log("🔍 [Customer] Current roomId from ref:", rid);

      // 1. Get from sessionStorage
      if (!rid && storageKey) {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          rid = Number(saved);
          console.log(
            "♻️ [Customer] Recovered roomId from sessionStorage:",
            rid
          );
        }
      }

      let msgs: any[] = [];

      // 2. Try load messages
      if (rid) {
        try {
          msgs = await loadMessages(rid);
        } catch (e: any) {
          if (e.message === "ROOM_NOT_FOUND") {
            console.log("🗑️ [Customer] Room not found, will create new one");
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

      // 3. Create room if needed
      if (!rid) {
        console.log("🆕 [Customer] Creating new room...");
        const res = await chatRoomApi.createRoom({ adminId: 1 });
        rid = res.data.id;
        console.log("✅ [Customer] New room created with id:", rid);

        if (storageKey) {
          sessionStorage.setItem(storageKey, String(rid));
        }
        msgs = await loadMessages(rid);
      }

      // 4. Update state
      setRoomId(rid);
      roomIdRef.current = rid;
      console.log("💾 [Customer] Room set in state and ref:", rid);

      if (currentUserId && msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.sentAt) {
          const key = getLastReadKey(currentUserId, rid!);
          localStorage.setItem(key, lastMsg.sentAt);
        }
      }

      setHasUnread(false);
      if (rid) {
        console.log("🔌 [Customer] Connecting WebSocket for room:", rid);
        connectWsForRoom(rid);
      }
    } catch (err) {
      console.error("❌ [Customer] ensureRoomAndConnect error:", err);
    }
  };

  const handleSend = () => {
    if (!roomIdRef.current || !text.trim()) return;

    const payload = {
      content: text,
      fileUrl: null,
      contentType: "TEXT",
    };

    console.log("🚀 Sending message:", payload, "to room:", roomIdRef.current);
    ws.sendMessage(roomIdRef.current, payload);
    setText("");

    if (userIdRef.current) {
      const key = getLastReadKey(userIdRef.current, roomIdRef.current);
      localStorage.setItem(key, new Date().toISOString());
    }
  };

  const toggleChat = async () => {
    if (!showChat) {
      console.log(
        "🎯 [Customer] toggleChat - opening chat. Current userId:",
        userIdRef.current,
        "user.id:",
        user?.id
      );

      // Ensure userIdRef is set before proceeding
      if (!userIdRef.current && user?.id) {
        userIdRef.current = Number(user.id);
        console.log(
          "🔧 [Customer] Set userIdRef from user.id:",
          userIdRef.current
        );
      }

      if (!userIdRef.current) {
        console.error("❌ [Customer] Cannot open chat - user not logged in");
        return;
      }

      setShowChat(true);
      await ensureRoomAndConnect();
    } else {
      setShowChat(false);
    }
  };

  return {
    isOpen: showChat,
    toggleChat,
    messages,
    input: text,
    setInput: setText,
    handleSend,
    unreadCount: hasUnread ? 1 : 0,
    messagesEndRef,
    user,
    isLoggedIn: !!user,
  };
}
