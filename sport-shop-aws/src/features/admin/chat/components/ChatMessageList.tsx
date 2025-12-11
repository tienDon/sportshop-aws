import React, { useEffect, useRef } from "react";
import { groupMessages } from "@/legacy-chat/utils/groupMessagesByDate";
import { formatDateHeader } from "@/legacy-chat/utils/formatDateHeader";
import { formatChatTime } from "@/legacy-chat/utils/formatTime";
import api from "@/lib/axios";

const BASE_URL = api.defaults.baseURL || "";

interface Message {
  messageId: number;
  senderId: number;
  content?: string;
  fileUrl?: string;
  contentType?: string;
  sentAt: string;
  isMine: boolean;
}

interface ChatMessageListProps {
  messages: Message[];
  onImageClick: (url: string) => void;
  scrollTrigger?: number | string; // Trigger scroll khi giá trị này thay đổi
}

export function ChatMessageList({
  messages,
  onImageClick,
  scrollTrigger,
}: ChatMessageListProps) {
  const grouped = groupMessages(messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  const lastScrollTriggerRef = useRef<string | number | undefined>();

  // Reset isInitialLoad khi chọn room mới (scrollTrigger thay đổi)
  useEffect(() => {
    if (scrollTrigger !== undefined && scrollTrigger !== lastScrollTriggerRef.current) {
      isInitialLoadRef.current = true;
      lastScrollTriggerRef.current = scrollTrigger;
    }
  }, [scrollTrigger]);

  // Scroll xuống cuối khi có tin nhắn mới hoặc khi scrollTrigger thay đổi
  useEffect(() => {
    if (!containerRef.current) return;

    // Lần đầu load room mới: scroll ngay lập tức (không smooth)
    if (isInitialLoadRef.current && messages.length > 0) {
      isInitialLoadRef.current = false;
      // Scroll ngay lập tức
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
      }, 50);
      return;
    }

    // Các lần sau: scroll smooth khi có tin nhắn mới
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [messages.length, scrollTrigger]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
      {grouped.map((item: any, index: number) => {
        if (item.type === "date") {
          return (
            <div
              key={`date-${index}`}
              className="text-center my-4 text-muted-foreground text-sm font-semibold"
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
            className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`inline-block max-w-[80%] rounded-lg px-3 py-2 ${
                msg.isMine
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 dark:bg-slate-800 text-foreground"
              }`}
            >
              {isImage && fullUrl && (
                <img
                  src={fullUrl}
                  alt="message"
                  className="max-w-[260px] rounded-md mb-2 cursor-pointer"
                  onClick={() => onImageClick(fullUrl)}
                />
              )}

              {isVideo && fullUrl && (
                <video
                  controls
                  className="max-w-[260px] rounded-md mb-2"
                >
                  <source src={fullUrl} />
                </video>
              )}

              {isFile && fullUrl && (
                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block mb-2 underline ${
                    msg.isMine ? "text-white" : "text-blue-600"
                  }`}
                >
                  📎 Download file
                </a>
              )}

              {!msg.fileUrl && msg.content && (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}

              <div
                className={`text-xs mt-1 opacity-80 ${
                  msg.isMine ? "text-right" : "text-right"
                }`}
              >
                {formatChatTime(msg.sentAt)}
              </div>
            </div>
          </div>
        );
      })}

      {messages.length === 0 && (
        <div className="text-center text-muted-foreground text-sm py-8">
          Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

