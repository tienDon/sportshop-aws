import React, { useEffect, useState, useRef } from "react";
import { chatRoomApi, chatApi } from "../api/legacy-chat-api";
import RoomList from "../components/RoomList";
import ws from "../websocket/ws";
import { groupMessages } from "../utils/groupMessagesByDate";
import { formatDateHeader } from "../utils/formatDateHeader";
import { formatChatTime } from "../utils/formatTime";
// import LogoutButton from "../components/LogoutButton";
import api from "@/lib/axios";

const BASE_URL = api.defaults.baseURL || "";

export default function AdminDashboard() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [adminId, setAdminId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const subscriptionRef = useRef(null);
  const newRoomSubRef = useRef(null);
  const selectedRoomRef = useRef(null);

  const getLastReadKey = (uid, roomId) => `admin_last_read_${uid}_${roomId}`;

  useEffect(() => {
    const uid = sessionStorage.getItem("userId");
    if (uid) setAdminId(Number(uid));
  }, []);

  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  const loadRooms = async (isInitial = false) => {
    if (!adminId) return;
    try {
      const res = await chatRoomApi.getAdminRooms();
      setRooms(() => {
        const list = res.data.map((r) => {
          let hasUnread = false;

          if (adminId) {
            const key = getLastReadKey(adminId, r.id);
            const stored = localStorage.getItem(key);

            if (r.lastMessageAt) {
              if (!stored) {
                // lần đầu chưa có dữ liệu -> coi như chưa đọc
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

          // phòng đang mở thì không hiển thị unread
          if (r.id === selectedRoomRef.current) {
            hasUnread = false;
          }

          return { ...r, hasUnread };
        });

        list.sort((a, b) => {
          if (!a.lastMessageAt && !b.lastMessageAt) return 0;
          if (!a.lastMessageAt) return 1;
          if (!b.lastMessageAt) return -1;
          return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
        });

        return list;
      });
    } catch (err) {
      console.error("loadRooms error:", err);
    }
  };

  // load rooms lần đầu + polling
  useEffect(() => {
    if (!adminId) return;
    loadRooms(true);
    const interval = setInterval(() => loadRooms(false), 5000);
    return () => clearInterval(interval);
  }, [adminId]);

  // WebSocket: lắng nghe room mới
  useEffect(() => {
    if (!adminId) return;

    ws.connect(
      () => {
        if (!newRoomSubRef.current) {
          newRoomSubRef.current = ws.subscribeNewRoom((room) => {
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

              updated.sort((a, b) => {
                if (!a.lastMessageAt && !b.lastMessageAt) return 0;
                if (!a.lastMessageAt) return 1;
                if (!b.lastMessageAt) return -1;
                return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
              });

              return updated;
            });
          });
        }
      },
      (err) => {
        console.error("WS connect error:", err);
      }
    );

    return () => {
      if (newRoomSubRef.current) {
        try {
          newRoomSubRef.current.unsubscribe();
        } catch (e) {
          console.error(e);
        }
        newRoomSubRef.current = null;
      }

      if (subscriptionRef.current) {
        try {
          subscriptionRef.current.unsubscribe();
        } catch (e) {
          console.error(e);
        }
        subscriptionRef.current = null;
      }
    };
  }, [adminId]);

  const loadMessages = async (roomId) => {
    const res = await chatApi.getMessages(roomId);
    const mapped = res.data.map((m) => ({
      ...m,
      isMine: m.senderId === adminId,
    }));
    setMessages(mapped);
    return mapped;
  };

  const selectRoom = async (roomId) => {
    setSelectedRoom(roomId);

    // clear unread cho room vừa click
    setRooms((oldRooms) =>
      oldRooms.map((r) => (r.id === roomId ? { ...r, hasUnread: false } : r))
    );

    const msgs = await loadMessages(roomId);
    const lastMsg = msgs[msgs.length - 1];
    if (adminId && lastMsg && lastMsg.sentAt) {
      const key = getLastReadKey(adminId, roomId);
      localStorage.setItem(key, lastMsg.sentAt);
    }

    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
      } catch (e) {
        console.error(e);
      }
    }

    subscriptionRef.current = ws.subscribeRoom(roomId, (msg) => {
      setMessages((old) => [
        ...old,
        { ...msg, isMine: msg.senderId === adminId },
      ]);

      // đang xem phòng này -> coi như đã đọc
      if (adminId && msg.sentAt) {
        const key = getLastReadKey(adminId, roomId);
        localStorage.setItem(key, msg.sentAt);
      }

      // cập nhật lastMessageAt + đẩy room lên đầu
      setRooms((oldRooms) => {
        const updated = oldRooms.map((r) =>
          r.id === roomId
            ? { ...r, lastMessageAt: msg.sentAt, hasUnread: false }
            : r
        );

        updated.sort((a, b) => {
          if (!a.lastMessageAt && !b.lastMessageAt) return 0;
          if (!a.lastMessageAt) return 1;
          if (!b.lastMessageAt) return -1;
          return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
        });

        return updated;
      });
    });
  };

  const sendMessage = async () => {
    if (!selectedRoom) return;

    // TEXT ONLY
    if (text.trim().length > 0 && !pendingFile) {
      ws.sendMessage(selectedRoom, {
        content: text,
        fileUrl: null,
        contentType: "TEXT",
      });
      setText("");

      if (adminId) {
        const key = getLastReadKey(adminId, selectedRoom);
        localStorage.setItem(key, new Date().toISOString());
      }

      return;
    }

    // FILE ONLY
    if (pendingFile) {
      try {
        const res = await chatApi.uploadFile(pendingFile);
        const { url, contentType } = res.data;

        ws.sendMessage(selectedRoom, {
          content: null,
          fileUrl: url,
          contentType,
        });

        setPendingFile(null);

        if (adminId) {
          const key = getLastReadKey(adminId, selectedRoom);
          localStorage.setItem(key, new Date().toISOString());
        }
      } catch (err) {
        console.error("uploadFile error:", err);
        alert("Cannot upload file");
      }
    }
  };

  const onPickFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile(file);
    e.target.value = "";
  };

  const grouped = groupMessages(messages);
  return (
    <div style={{ display: "flex" }}>
      <RoomList
        rooms={rooms}
        selectedRoomId={selectedRoom}
        onSelect={selectRoom}
      />

      <div style={{ flex: 1, padding: 20, position: "relative" }}>
        {/* Header + Logout */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: 0 }}>Admin Chat Panel</h2>
          {/* <LogoutButton /> */}
        </div>

        {selectedRoom && (
          <h4 style={{ marginTop: -10, marginBottom: 10 }}>
            Room #{selectedRoom}
          </h4>
        )}

        {!selectedRoom && <p>Chọn một phòng chat để bắt đầu.</p>}

        {selectedRoom && (
          <>
            {/* MESSAGE LIST */}
            <div
              style={{
                height: "70vh",
                overflowY: "auto",
                padding: 10,
                border: "1px solid #ddd",
                borderRadius: 6,
                background: "#fafafa",
                marginBottom: 10,
              }}
            >
              {grouped.map((item, index) => {
                if (item.type === "date") {
                  return (
                    <div
                      key={"date-" + index}
                      style={{
                        textAlign: "center",
                        margin: "10px 0",
                        color: "#666",
                        fontSize: 13,
                        fontWeight: "bold",
                      }}
                    >
                      {formatDateHeader(item.date)}
                    </div>
                  );
                }

                const msg = item.msg;
                const isImage = msg.fileUrl && msg.contentType === "IMAGE";
                const isVideo = msg.fileUrl && msg.contentType === "VIDEO";
                const isFile = msg.fileUrl && msg.contentType === "FILE";

                const fullUrl = msg.fileUrl
                  ? msg.fileUrl.startsWith("http")
                    ? msg.fileUrl
                    : `${BASE_URL}${msg.fileUrl}`
                  : null;

                return (
                  <div
                    key={msg.messageId}
                    style={{
                      marginBottom: 10,
                      textAlign: msg.isMine ? "right" : "left",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        padding: "8px 12px",
                        borderRadius: 6,
                        background: msg.isMine ? "#007bff" : "#e0e0e0",
                        color: msg.isMine ? "white" : "black",
                        maxWidth: "80%",
                      }}
                    >
                      {isImage && (
                        <img
                          src={fullUrl}
                          style={{
                            maxWidth: 260,
                            borderRadius: 6,
                            marginBottom: 4,
                            cursor: "pointer",
                          }}
                          onClick={() => setPreviewImage(fullUrl)}
                        />
                      )}

                      {isVideo && (
                        <video
                          controls
                          style={{
                            maxWidth: 260,
                            borderRadius: 6,
                            marginBottom: 4,
                          }}
                        >
                          <source src={fullUrl} />
                        </video>
                      )}

                      {isFile && (
                        <a
                          href={fullUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: msg.isMine ? "white" : "blue",
                            textDecoration: "underline",
                            marginBottom: 4,
                            display: "block",
                          }}
                        >
                          📎 Download file
                        </a>
                      )}

                      {!msg.fileUrl && msg.content && <div>{msg.content}</div>}

                      <div
                        style={{
                          fontSize: 11,
                          marginTop: 4,
                          opacity: 0.8,
                          textAlign: "right",
                        }}
                      >
                        {formatChatTime(msg.sentAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ⭐ PREVIEW FILE TRƯỚC KHI GỬI (GIỐNG CUSTOMER) ⭐ */}
            {pendingFile && (
              <div
                style={{
                  padding: 10,
                  borderTop: "1px solid #ddd",
                  background: "#fafafa",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                {pendingFile.type && pendingFile.type.startsWith("image") ? (
                  <img
                    src={URL.createObjectURL(pendingFile)}
                    alt="preview"
                    style={{
                      height: 65,
                      borderRadius: 6,
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      padding: "6px 10px",
                      background: "#eee",
                      borderRadius: 6,
                      fontSize: 13,
                    }}
                  >
                    {pendingFile.name}
                  </div>
                )}

                <span
                  style={{
                    cursor: "pointer",
                    fontSize: 20,
                    fontWeight: "bold",
                    padding: "0 6px",
                  }}
                  onClick={() => setPendingFile(null)}
                >
                  ✖
                </span>
              </div>
            )}

            {/* INPUT */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                paddingTop: 10,
              }}
            >
              <label
                style={{
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                📎
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={onPickFile}
                />
              </label>

              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                style={{ flex: 1, padding: 8 }}
                placeholder="Nhập tin nhắn..."
              />

              <button onClick={sendMessage} style={{ marginLeft: 10 }}>
                Send
              </button>
            </div>
          </>
        )}

        {/* IMAGE ZOOM OVERLAY */}
        {previewImage && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999999,
            }}
            onClick={() => setPreviewImage(null)}
          >
            <img
              src={previewImage}
              alt="full"
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                borderRadius: 8,
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
