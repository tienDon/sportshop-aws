// src/legacy-chat/components/ChatBox.jsx
import React, { useState, useEffect, useRef } from "react";
import { groupMessages } from "../utils/groupMessagesByDate";
import { formatDateHeader } from "../utils/formatDateHeader";
import { formatChatTime } from "../utils/formatTime";

// ✅ Dùng axios instance của FE-needd-to-fix để lấy baseURL
import api from "@/lib/axios";

const BASE_URL = api.defaults.baseURL || "";

export default function ChatBox({ messages, onSend, onSendFile, onClose }) {
  const [text, setText] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // ⭐ zoom ảnh
  
  // Refs cho scroll
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const isInitialLoadRef = useRef(true);

  const send = () => {
    if (text.trim().length > 0) {
      onSend(text);
      setText("");
    }

    if (pendingFile) {
      onSendFile(pendingFile);
      setPendingFile(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPendingFile(file);
    e.target.value = "";
  };

  const grouped = groupMessages(messages);

  // Auto scroll xuống cuối khi có tin nhắn mới hoặc khi mở chat box
  useEffect(() => {
    if (!containerRef.current) return;

    // Lần đầu load messages: scroll ngay lập tức (không smooth)
    if (isInitialLoadRef.current && messages.length > 0) {
      isInitialLoadRef.current = false;
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 100); // Tăng timeout để đảm bảo DOM đã render
      return;
    }

    // Các lần sau: scroll smooth khi có tin nhắn mới
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // Reset isInitialLoad khi component mount lại (mở chat box lại)
  useEffect(() => {
    isInitialLoadRef.current = true;
    // Scroll ngay khi mở chat box nếu đã có messages
    if (messages.length > 0) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 90,
        right: 20,
        width: isExpanded ? 420 : 320,
        height: isExpanded ? "80vh" : 420,
        maxHeight: "80vh",
        background: "white",
        border: "1px solid #ddd",
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 999999,
        transition: "0.25s ease",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          padding: 10,
          background: "#007bff",
          color: "white",
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: "bold" }}>Chat with Admin</span>

        <div style={{ display: "flex", gap: 12 }}>
          <span
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ cursor: "pointer", fontSize: 18 }}
          >
            {isExpanded ? "🔽" : "🔼"}
          </span>

          <span onClick={onClose} style={{ cursor: "pointer" }}>
            ✖
          </span>
        </div>
      </div>

      {/* BODY (MESSAGES) */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          padding: 10,
          overflowY: "auto",
          background: "#f7f7f7",
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
                marginBottom: 8,
                textAlign: msg.isMine ? "right" : "left",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: msg.isMine ? "#007bff" : "#e0e0e0",
                  color: msg.isMine ? "white" : "black",
                  maxWidth: "80%",
                }}
              >
                {isImage && fullUrl && (
                  <img
                    src={fullUrl}
                    style={{
                      maxWidth: 220,
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                    onClick={() => setPreviewImage(fullUrl)} // ⭐ zoom
                  />
                )}

                {isVideo && fullUrl && (
                  <video controls style={{ maxWidth: 220, borderRadius: 6 }}>
                    <source src={fullUrl} />
                  </video>
                )}

                {isFile && fullUrl && (
                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: msg.isMine ? "white" : "blue",
                      textDecoration: "underline",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    📎 Download file
                  </a>
                )}

                {!msg.fileUrl && msg.content && <div>{msg.content}</div>}

                <div
                  style={{
                    fontSize: 11,
                    opacity: 0.7,
                    marginTop: 2,
                    textAlign: msg.isMine ? "right" : "left",
                  }}
                >
                  {formatChatTime(msg.sentAt)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ⭐ PREVIEW FILE TRƯỚC KHI GỬI ⭐ */}
      {pendingFile && (
        <div
          style={{
            padding: 10,
            borderTop: "1px solid #ddd",
            background: "#fafafa",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {pendingFile.type.startsWith("image") ? (
            <img
              src={URL.createObjectURL(pendingFile)}
              alt="preview"
              style={{ height: 65, borderRadius: 6, objectFit: "cover" }}
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

      {/* INPUT AREA */}
      <div
        style={{
          padding: 10,
          borderTop: "1px solid #ddd",
          display: "flex",
          gap: 6,
          alignItems: "center",
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
            onChange={handleFileChange}
          />
        </label>

        <input
          style={{ flex: 1, padding: 6 }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type message..."
        />

        <button onClick={send} style={{ marginLeft: 5 }}>
          Send
        </button>
      </div>

      {/* ⭐ OVERLAY ZOOM ẢNH ⭐ */}
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
  );
}
