import React, { useEffect, useRef } from "react";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import { ImagePreviewModal } from "./ImagePreviewModal";

interface Message {
  messageId: number;
  senderId: number;
  content?: string;
  fileUrl?: string;
  contentType?: string;
  sentAt: string;
  isMine: boolean;
}

interface ChatWindowProps {
  selectedRoomId: number | null;
  messages: Message[];
  text: string;
  setText: (text: string) => void;
  pendingFile: File | null;
  setPendingFile: (file: File | null) => void;
  previewImage: string | null;
  setPreviewImage: (url: string | null) => void;
  onSend: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ChatWindow({
  selectedRoomId,
  messages,
  text,
  setText,
  pendingFile,
  setPendingFile,
  previewImage,
  setPreviewImage,
  onSend,
  onFileChange,
}: ChatWindowProps) {
  // Scroll trigger: thay đổi khi chọn room mới hoặc có tin nhắn mới
  const scrollTrigger = `${selectedRoomId}-${messages.length}`;

  if (!selectedRoomId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Chọn một phòng chat để bắt đầu.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Messages area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <ChatMessageList
              messages={messages}
              onImageClick={setPreviewImage}
              scrollTrigger={scrollTrigger}
            />
          </div>
        </div>

        {/* Input area */}
        <ChatInput
          text={text}
          setText={setText}
          pendingFile={pendingFile}
          setPendingFile={setPendingFile}
          onSend={onSend}
          onFileChange={onFileChange}
        />
      </div>

      {/* Image preview modal */}
      <ImagePreviewModal
        imageUrl={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </>
  );
}
