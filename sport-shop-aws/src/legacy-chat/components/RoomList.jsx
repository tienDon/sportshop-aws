// src/components/RoomList.jsx
import React from "react";

export default function RoomList({ rooms, selectedRoomId, onSelect }) {
  return (
    <div
      style={{
        width: 240,
        borderRight: "1px solid #ddd",
        height: "100vh",
        overflowY: "auto",
        padding: 12,
        background: "#fafafa",
      }}
    >
      <h3 style={{ marginBottom: 15 }}>Chat Rooms</h3>

      {rooms.map((room) => (
        <div
          key={room.id}
          onClick={() => onSelect(room.id)}
          style={{
            padding: "10px 8px",
            marginBottom: 10,
            borderRadius: 8,
            cursor: "pointer",
            background: selectedRoomId === room.id ? "#007bff" : "white",
            color: selectedRoomId === room.id ? "white" : "black",
            border: selectedRoomId === room.id ? "none" : "1px solid #ddd",
            transition: "0.2s",
          }}
        >
          {/* Tên + red dot */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: 15 }}>
              {room.customerName || "Khách hàng"}
            </div>

            {room.hasUnread && (
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: selectedRoomId === room.id ? "#fff" : "#ff4d4f",
                  border: "1px solid #fff",
                }}
              />
            )}
          </div>

          <div style={{ fontSize: 12, opacity: 0.8 }}>Room #{room.id}</div>

          {room.adminName && (
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Admin: {room.adminName}
            </div>
          )}

          {room.lastMessageAt && (
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
              Last: {new Date(room.lastMessageAt).toLocaleString()}
            </div>
          )}
        </div>
      ))}

      {rooms.length === 0 && (
        <div style={{ fontSize: 13, opacity: 0.7 }}>
          Chưa có phòng chat nào.
        </div>
      )}
    </div>
  );
}
