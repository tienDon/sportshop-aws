// src/legacy-chat/api/legacy-chat-api.ts
// Sử dụng axios instance của FE-needd-to-fix
import api from "@/lib/axios";

/**
 * ============================
 *  CHAT ROOM API
 * ============================
 * Dùng cho:
 *  - CustomerChat.jsx
 *  - AdminDashboard.jsx
 */
export const chatRoomApi = {
  // tạo phòng chat (customer -> admin)
  createRoom: (data: any) => api.post("/api/chat/rooms", data),

  // lấy danh sách phòng chat của customer đang login
  getMyRooms: () => api.get("/api/chat/rooms/me"),

  // lấy danh sách phòng của admin
  getAdminRooms: () => api.get("/api/chat/rooms/admin/me"),
};

/**
 * ============================
 *  CHAT MESSAGE API
 * ============================
 * Dùng cho:
 *  - load messages
 *  - gửi text
 *  - gửi file (ảnh/chat attachment)
 */
export const chatApi = {
  // load toàn bộ messages của 1 room
  getMessages: (roomId: number) =>
    api.get(`/api/chat/rooms/${roomId}/messages`),

  // gửi message text
  sendMessage: (roomId: number, body: any) =>
    api.post(`/api/chat/rooms/${roomId}/messages`, body),

  // upload file (ảnh/video/tài liệu)
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post("/api/chat/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
