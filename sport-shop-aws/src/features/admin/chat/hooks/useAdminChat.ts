import { useState, useEffect, useRef } from "react";
import { chatRoomApi, chatApi } from "@/services/chat.service";
import type { ChatRoom, ChatMessage } from "@/services/chat.service";
import ws from "@/services/ws.service";
import { useAuthStore } from "@/store/useAuthStore";

// Map raw message từ BE (ChatMessageResponse) -> ChatMessage dùng cho UI
const mapToAdminMessage = (
  raw: any,
  currentUserId?: number | string | null
): ChatMessage => {
  const myId =
    currentUserId !== undefined && currentUserId !== null
      ? Number(currentUserId)
      : undefined;

  // Xác định type TEXT / IMAGE / FILE dựa vào fileUrl + contentType
  let type: ChatMessage["type"] = "TEXT";
  if (raw.fileUrl) {
    const ct = (raw.contentType || "").toString().toUpperCase();
    if (ct.includes("IMAGE")) {
      type = "IMAGE";
    } else {
      type = "FILE";
    }
  }

  // Xác định sender là ADMIN hay CUSTOMER
  const sender: ChatMessage["sender"] =
    myId !== undefined && raw.senderId !== undefined && raw.senderId !== null
      ? Number(raw.senderId) === myId
        ? "ADMIN"
        : "CUSTOMER"
      : "CUSTOMER";

  return {
    id: raw.messageId ?? raw.id ?? Date.now(),
    sender,
    type,
    content: raw.content ?? "",
    fileUrl: raw.fileUrl ?? null,
    sentAt: raw.sentAt ?? new Date().toISOString(),
  } as ChatMessage;
};

export function useAdminChat() {
  const { user } = useAuthStore();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const subscriptionRef = useRef<any>(null);
  const newRoomSubRef = useRef<any>(null);
  const selectedRoomRef = useRef<number | null>(null);

  const getLastReadKey = (uid: number, roomId: number) =>
    `admin_last_read_${uid}_${roomId}`;

  useEffect(() => {
    selectedRoomRef.current = selectedRoomId;
  }, [selectedRoomId]);

  const loadRooms = async (isInitial = false) => {
    if (!user?._id) return;

    try {
      const res = await chatRoomApi.getAdminRooms();
      const rawRooms: ChatRoom[] = res.data || [];

      // Đánh dấu hasUnread dựa trên lastMessageAt + last_read trong localStorage
      const mapped = rawRooms.map((r) => {
        const key = getLastReadKey(Number(user._id), r.id);
        const lastRead = localStorage.getItem(key);
        let hasUnread = false;

        if (r.lastMessageAt && lastRead) {
          hasUnread = new Date(r.lastMessageAt) > new Date(lastRead);
        } else if (r.lastMessageAt && !lastRead) {
          hasUnread = true;
        }

        return { ...r, hasUnread };
      });

      setRooms(mapped);

      // Lần đầu load, auto chọn phòng đầu
      if (isInitial && mapped.length > 0 && !selectedRoomId) {
        setSelectedRoomId(mapped[0].id);
      }
    } catch (err) {
      console.error("Failed to load rooms", err);
    }
  };

  // Lần đầu: load rooms + connect WS để nhận room mới
  useEffect(() => {
    if (!user?._id) return;

    loadRooms(true);

    ws.connect(
      () => {
        // subscribe topic room mới cho admin nếu BE có
        if (!newRoomSubRef.current && ws.subscribeAdminRoomUpdated) {
          newRoomSubRef.current = ws.subscribeAdminRoomUpdated((room: any) => {
            setRooms((prev) => {
              const exists = prev.some((r) => r.id === room.id);
              if (exists) return prev;
              return [room, ...prev];
            });
          });
        }
      },
      (err) => console.error("WS Error", err)
    );

    return () => {
      // có thể cleanup thêm nếu cần
    };
  }, [user?._id]);

  // Load messages khi chọn room
  useEffect(() => {
    if (!selectedRoomId || !user?._id) return;

    // Mark as read
    const key = getLastReadKey(Number(user._id), selectedRoomId);
    localStorage.setItem(key, new Date().toISOString());

    // Update local state để clear chấm đỏ
    setRooms((prev) =>
      prev.map((r) =>
        r.id === selectedRoomId ? { ...r, hasUnread: false } : r
      )
    );

    const fetchMessages = async () => {
      try {
        const res = await chatApi.getMessages(selectedRoomId);
        const rawMessages = res.data || [];
        const mapped = rawMessages.map((m: any) =>
          mapToAdminMessage(m, user?._id)
        );
        setMessages(mapped);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();

    // Subscribe vào room
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = ws.subscribeRoom(
      selectedRoomId,
      (rawMsg: any) => {
        const mapped = mapToAdminMessage(rawMsg, user?._id);
        setMessages((prev) => [...prev, mapped]);

        // Cập nhật last read nếu đang đứng ở room này
        if (selectedRoomRef.current === selectedRoomId) {
          localStorage.setItem(key, new Date().toISOString());
        }
      }
    );

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [selectedRoomId, user?._id]);

  const handleSend = async () => {
    if (!selectedRoomId) return;

    // Gửi TEXT
    if (text.trim().length > 0) {
      // ws.service đã lo wrap thành {content, fileUrl:null, contentType:"TEXT"}
      ws.sendMessage(selectedRoomId, text.trim());
      setText("");
    }

    // Gửi FILE
    if (pendingFile) {
      try {
        const res = await chatApi.uploadFile(pendingFile);
        // BE trả { url, contentType }
        const { url, contentType } = res.data;

        ws.sendMessage(selectedRoomId, {
          content: pendingFile.name,
          fileUrl: url,
          contentType,
        });

        setPendingFile(null);
      } catch (err) {
        console.error("Upload error:", err);
      }
    }
  };

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
    messages,
    text,
    setText,
    pendingFile,
    setPendingFile,
    previewImage,
    setPreviewImage,
    handleSend,
    handleFileChange,
  };
}
