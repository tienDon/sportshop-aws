import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

const ProductGallery = ({ images, productName }: ProductGalleryProps) => {
  // State để quản lý ảnh đang hiển thị
  const [activeImage, setActiveImage] = useState<string>(images[0] || "");

  // Cập nhật activeImage khi images prop thay đổi (ví dụ chuyển sang sản phẩm khác)
  useEffect(() => {
    if (images.length > 0) setActiveImage(images[0]);
  }, [images]);

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Main Image Container */}
      {/* Mô phỏng cấu trúc của SuperSports: Wrapper responsive với aspect-ratio vuông */}
      <div className="relative w-full bg-white rounded-lg overflow-hidden border border-gray-100 group">
        <div className="aspect-square w-full relative">
          <img
            src={activeImage}
            alt={productName}
            className="absolute inset-0 w-full h-full object-contain p-2 cursor-pointer"
            loading="eager"
          />

          {/* Badge/Label có thể thêm ở đây (ví dụ: Mới, Sale) */}
        </div>
      </div>

      {/* Thumbnails Grid */}
      {/* Hiển thị danh sách ảnh nhỏ bên dưới */}
      <div className="mx-auto flex gap-2 overflow-x-auto">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(img)}
            className={cn(
              "w-20 h-20 border rounded overflow-hidden flex-shrink-0",
              activeImage === img ? "border-black" : "border-transparent"
            )}
            aria-label={`View image ${idx + 1}`}
          >
            <img src={img} alt="" className="w-full h-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
