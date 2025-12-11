import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImagePreviewModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function ImagePreviewModal({
  imageUrl,
  onClose,
}: ImagePreviewModalProps) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:bg-white/20"
        >
          <X className="h-6 w-6" />
        </Button>
        <img
          src={imageUrl}
          alt="preview"
          className="max-w-full max-h-[90vh] rounded-lg object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
