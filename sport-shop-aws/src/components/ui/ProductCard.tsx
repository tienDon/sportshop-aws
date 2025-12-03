import { Badge } from "@/components/ui/badge";
import type { ProductBadge } from "@/types/api";

interface ProductCardProps {
  id: string | number;
  name: string;
  image: string;
  originalPrice: string | number;
  salePrice?: string | number;
  badge?: ProductBadge;
  rating?: number;
  reviews?: number;
  colors?: string[];
  brand: string;
  className?: string;
  slug?: string;
}

const ProductCard = ({
  name,
  image,
  originalPrice,
  salePrice,
  badge,
  rating,
  reviews,
  colors,
  brand,
  className = "",
}: ProductCardProps) => {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <div className="flex items-center text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="text-sm">
            ★
          </span>
        ))}
        {hasHalfStar && <span className="text-sm">☆</span>}
      </div>
    );
  };

  const renderColorOptions = (colors: string[]) => (
    <div className="flex gap-1 mt-2">
      {colors.map((color, index) => (
        <div
          key={index}
          className="w-3 h-3 rounded-full border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
          style={{
            backgroundColor:
              color === "black" ? "#000" : color === "gray" ? "#6B7280" : color,
          }}
        />
      ))}
    </div>
  );

  const formatPrice = (price: string | number | undefined) => {
    if (price === undefined || price === null) return "";
    if (typeof price === "number") {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
    }
    return price;
  };

  return (
    <div
      className={`group bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${className}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badge */}
        {badge && (
          <Badge
            className="absolute top-3 right-3 text-white font-bold"
            style={{ backgroundColor: badge.display_color }}
          >
            {badge.display_text}
          </Badge>
        )}
      </div>

      <div className="p-4">
        {/* Brand */}
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">
          {brand}
        </p>

        {/* Product Name */}
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {name}
        </h3>

        {/* Rating and Reviews */}
        {(rating !== undefined || reviews !== undefined) && (
          <div className="flex items-center gap-2 mb-3">
            {renderStars(rating || 0)}
            <span className="text-xs text-gray-500">
              {reviews || 0} đánh giá
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          {salePrice ? (
            <>
              <span className="text-base font-bold text-red-600">
                {formatPrice(salePrice)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            </>
          ) : (
            <span className="text-base font-bold text-gray-900">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Color Options */}
        {colors && renderColorOptions(colors)}
      </div>
    </div>
  );
};

export default ProductCard;
