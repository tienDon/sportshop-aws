import React, { useState, useEffect } from "react";
import type { BackendProduct } from "@/types/api";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: BackendProduct["images"];
  productName: string;
}

const ProductGallery = ({ images, productName }: ProductGalleryProps) => {
  // State để quản lý ảnh đang hiển thị
  const [activeImage, setActiveImage] = useState<string>(
    images.find((img) => img.is_main)?.url || images[0]?.url
  );

  // Cập nhật activeImage khi images prop thay đổi (ví dụ chuyển sang sản phẩm khác)
  useEffect(() => {
    const main = images.find((img) => img.is_main)?.url || images[0]?.url;
    if (main) setActiveImage(main);
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
      <div className="mx-auto">
        {images.map((img, idx) => (
          <button
            key={img.image_id || idx}
            onClick={() => setActiveImage(img.url)}
            onMouseEnter={() => setActiveImage(img.url)} // Hover để xem trước nhanh
            className={"w-25 h-30 "}
            aria-label={`View image ${idx + 1}`}
          >
            <img
              src={img.url}
              alt=""
              className="w-full h-full object-contain "
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
