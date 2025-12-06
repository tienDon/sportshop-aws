import React from "react";
import {
  Heart,
  Minus,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  ShoppingCartIcon,
  Truck,
} from "lucide-react";
import type { useProductDetail } from "@/hooks/useProductDetail";
import { cn, formatCurrency } from "@/lib/utils";

// Sử dụng ReturnType của hook để đảm bảo props đồng bộ
type ProductInfoProps = ReturnType<typeof useProductDetail>;

const ProductInfo = ({
  product,
  options,
  selectedColorId,
  setSelectedColorId,
  selectedSizeId,
  setSelectedSizeId,
  isSizeAvailable,
  isColorAvailable,
  displayPrice,
  quantity,
  handleQuantityChange,
  currentStock,
  isOutOfStock,
}: ProductInfoProps) => {
  if (!product) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header Info */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-500 tracking-wide uppercase">
          {product.brand.name}
        </h2>
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {product.name}
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-medium text-black">SKU:</span>
            <span>{product.variants[0]?.sku || "N/A"}</span>
          </div>
          <div className="h-4 w-px bg-gray-300"></div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-black">Danh mục:</span>
            <span className="text-blue-600 hover:underline cursor-pointer">
              {product.category_ids
                .filter((p) => p.is_primary)
                .map((p) => p._id.name)
                .join(", ")}
            </span>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-end gap-4">
        <p className="text-3xl font-bold text-red-600">
          {formatCurrency(displayPrice)}
        </p>
        {product.base_price > displayPrice && (
          <p className="text-lg text-gray-400 line-through mb-1">
            {formatCurrency(product.base_price)}
          </p>
        )}
      </div>

      <div className="h-px bg-gray-200" />

      <p>
        Màu sắc:{" "}
        {product.variants[0]?.color.name.toUpperCase() || "Đang cập nhật"}
      </p>

      <div className="flex items-center gap-3 mt-2">
        {product.images.map((img) => (
          <button
            className={cn(
              "w-20 ",
              selectedColorId === img.image_id && "ring-2 ring-red-500"
            )}
            key={img.image_id}
            onClick={() => setSelectedColorId(img.image_id)}
          >
            <img src={img.url} />
          </button>
        ))}
      </div>

      {/* Size Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">Kích thước</span>
          <button className="text-sm text-blue-600 underline hover:text-blue-800">
            Hướng dẫn chọn size
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {options.sizes.map((size) => {
            const isSelected = selectedSizeId === size._id;
            const isAvailable = isSizeAvailable(size._id);
            return (
              <button
                key={size._id}
                onClick={() => setSelectedSizeId(size._id)}
                disabled={!isAvailable}
                className={cn(
                  "flex items-center justify-center rounded-md border py-2.5 text-sm font-medium transition-all",
                  isSelected
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-gray-900 hover:border-gray-900",
                  !isAvailable &&
                    "opacity-40 cursor-not-allowed bg-gray-50 text-gray-400 hover:border-gray-200 decoration-slice line-through"
                )}
              >
                {size.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity & Actions */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-gray-300 rounded-md h-11">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1 || isOutOfStock}
              className="px-3 h-full hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= currentStock || isOutOfStock}
              className="px-3 h-full hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-gray-500">
            {isOutOfStock ? (
              <span className="text-red-500 font-medium">Hết hàng</span>
            ) : (
              `${currentStock} sản phẩm có sẵn`
            )}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            disabled={isOutOfStock}
            className="flex-1 bg-black text-white h-12 rounded-md font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wide"
          >
            <ShoppingCartIcon className="w-5 h-5" />
            Thêm vào giỏ
          </button>
          <button
            disabled={isOutOfStock}
            className="flex-1 border-2 border-black text-black h-12 rounded-md font-bold hover:bg-gray-50 transition-colors disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed uppercase tracking-wide"
          >
            Mua ngay
          </button>
          <button className="h-12 w-12 border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-50 hover:text-red-500 transition-colors">
            <Heart className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Trust Badges / Policies */}
      <div className="grid grid-cols-1 gap-3 pt-6 border-t border-gray-100 text-sm text-gray-600">
        <div className="flex items-center gap-3">
          <Truck className="w-5 h-5 text-gray-400" />
          <span>Miễn phí vận chuyển cho đơn hàng trên 1.000.000₫</span>
        </div>
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-gray-400" />
          <span>Đổi trả miễn phí trong vòng 30 ngày</span>
        </div>
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-gray-400" />
          <span>Hàng chính hãng 100% - Bảo hành uy tín</span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
