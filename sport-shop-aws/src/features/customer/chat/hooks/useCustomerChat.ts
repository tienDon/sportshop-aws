// ___________________________useCustomerChat.ts______________________________________________________

import { useState, useEffect, useRef } from "react";
import { chatRoomApi, chatApi } from "@/services/chat.service";
import type { ChatMessage } from "@/services/chat.service";
import ws from "@/services/ws.service";
import { useAuthStore } from "@/store/useAuthStore";

// Map raw message từ BE (ChatMessageResponse) -> ChatMessage cho UI customer
const mapToCustomerMessage = (
  raw: any,
  currentUserId?: number | string | null
): ChatMessage => {
  const myId =
    currentUserId !== undefined && currentUserId !== null
      ? Number(currentUserId)
      : undefined;

  let type: ChatMessage["type"] = "TEXT";
  if (raw.fileUrl) {
    const ct = (raw.contentType || "").toString().toUpperCase();
    if (ct.includes("IMAGE")) {
      type = "IMAGE";
    } else {
      type = "FILE";
    }
  }

  // Customer side: nếu senderId = user._id => "CUSTOMER", còn lại là "ADMIN"
  const sender: ChatMessage["sender"] =
    myId !== undefined && raw.senderId !== undefined && raw.senderId !== null
      ? Number(raw.senderId) === myId
        ? "CUSTOMER"
        : "ADMIN"
      : "ADMIN";

  return {
    id: raw.messageId ?? raw.id ?? Date.now(),
    sender,
    type,
    content: raw.content ?? "",
    fileUrl: raw.fileUrl ?? null,
    sentAt: raw.sentAt ?? new Date().toISOString(),
  } as ChatMessage;
};

export function useCustomerChat() {
  const { user, accessToken } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);

  const subscriptionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom khi mở chat / có msg mới
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Initialize chat (fetch room)
  useEffect(() => {
    if (!user || !accessToken) return;

    const initChat = async () => {
      try {
        const res = await chatRoomApi.getMyRooms();
        const rooms = Array.isArray(res.data) ? res.data : [res.data];

        if (rooms.length > 0 && rooms[0]) {
          const room = rooms[0];
          setRoomId(room.id);

          // Fetch messages từ BE rồi map
          const msgRes = await chatApi.getMessages(room.id);
          const rawMessages = msgRes.data || [];
          const mapped = rawMessages.map((m: any) =>
            mapToCustomerMessage(m, user._id)
          );
          setMessages(mapped);
        } else {
          // Nếu chưa có room -> tạo mới
          try {
            const newRoomRes = await chatRoomApi.createRoom({
              customerName: user.full_name || user.email || "Customer",
            });
            if (newRoomRes.data) {
              setRoomId(newRoomRes.data.id);
            }
          } catch (createErr) {
            console.error("Failed to create room", createErr);
          }
        }
      } catch (err) {
        console.error("Failed to init chat", err);
      }
    };

    initChat();
  }, [user, accessToken]);

  // Connect WS và subscribe room
  useEffect(() => {
    if (!user || !roomId) return;

    setIsConnecting(true);

    ws.connect(
      () => {
        setIsConnecting(false);
        if (subscriptionRef.current) subscriptionRef.current.unsubscribe();

        subscriptionRef.current = ws.subscribeRoom(roomId, (rawMsg: any) => {
          const mapped = mapToCustomerMessage(rawMsg, user._id);
          setMessages((prev) => [...prev, mapped]);

          if (!isOpen) {
            setUnreadCount((prev) => prev + 1);
          }
        });
      },
      (err) => {
        console.error("WS Error", err);
        setIsConnecting(false);
      }
    );

    return () => {
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe();
    };
  }, [roomId, user, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !roomId) return;

    // Gửi TEXT: cứ gửi string, ws.service sẽ wrap thành {content, fileUrl:null, contentType:"TEXT"}
    ws.sendMessage(roomId, input.trim());
    setInput("");
  };

  const toggleChat = () => {
    const newOpen = !isOpen;
    setIsOpen(newOpen);
    if (newOpen) {
      setUnreadCount(0);
    }
  };

  return {
    isOpen,
    toggleChat,
    messages,
    input,
    setInput,
    handleSend,
    unreadCount,
    messagesEndRef,
    user,
    isLoggedIn: !!user,
  };
}
