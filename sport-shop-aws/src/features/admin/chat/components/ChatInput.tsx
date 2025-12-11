import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, X } from "lucide-react";

interface ChatInputProps {
  text: string;
  setText: (text: string) => void;
  pendingFile: File | null;
  setPendingFile: (file: File | null) => void;
  onSend: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function ChatInput({
  text,
  setText,
  pendingFile,
  setPendingFile,
  onSend,
  onFileChange,
  disabled = false,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t bg-background p-4 space-y-3">
      {/* Preview file trước khi gửi */}
      {pendingFile && (
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border">
          {pendingFile.type && pendingFile.type.startsWith("image") ? (
            <img
              src={URL.createObjectURL(pendingFile)}
              alt="preview"
              className="h-16 w-16 object-cover rounded-md"
            />
          ) : (
            <div className="h-16 w-16 flex items-center justify-center bg-slate-200 dark:bg-slate-800 rounded-md text-xs text-center px-2">
              {pendingFile.name}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{pendingFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(pendingFile.size / 1024).toFixed(2)} KB
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPendingFile(null)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="file-input"
          className="flex items-center justify-center h-10 w-10 rounded-lg border border-input bg-background hover:bg-accent cursor-pointer transition-colors"
        >
          <Paperclip className="h-4 w-4" />
          <input
            id="file-input"
            type="file"
            className="hidden"
            onChange={onFileChange}
            disabled={disabled}
          />
        </label>

        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn..."
          disabled={disabled}
          className="flex-1"
        />

        <Button
          onClick={onSend}
          disabled={disabled || (!text.trim() && !pendingFile)}
          size="default"
        >
          Gửi
        </Button>
      </div>
    </div>
  );
}

