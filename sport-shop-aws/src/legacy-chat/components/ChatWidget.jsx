// src/legacy-chat/components/ChatWidget.jsx
import React from "react";

export default function ChatWidget({ onOpen, hasUnread }) {
  return (
    <div
      onClick={onOpen}
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        cursor: "pointer",
        zIndex: 99999,
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "#007bff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white",
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          fontSize: 26,
          position: "relative",
        }}
      >
        {hasUnread && (
          <span
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#ff4d4f",
              border: "2px solid white",
            }}
          />
        )}
        💬
      </div>
    </div>
  );
}
