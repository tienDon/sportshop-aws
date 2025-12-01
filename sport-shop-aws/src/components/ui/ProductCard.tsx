import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: number;
  name: string;
  image: string;
  originalPrice: string;
  salePrice: string;
  discount: string;
  rating: number;
  reviews: number;
  colors: string[];
  isBlackFriday?: boolean;
  lastChance?: boolean;
  brand: string;
  className?: string;
}

const ProductCard = ({
  name,
  image,
  originalPrice,
  salePrice,
  discount,
  rating,
  reviews,
  colors,
  isBlackFriday = false,
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

  return (
    <div
      className={`group bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer ${className}`}
    >
      <div className="relative overflow-hidden">
        <img
          // src={image}
          src="https://placehold.co/260x190"
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Black Friday Badge */}
        {isBlackFriday && (
          <div className="absolute top-3 left-3">
            <div className="bg-black text-white text-xs font-bold px-2 py-1 transform -rotate-12">
              <span className="text-green-400">BLACK</span>
              <br />
              <span className="text-green-400">FRIDAY</span>
            </div>
          </div>
        )}

        {/* Discount Badge */}
        <Badge className="absolute top-3 right-3 bg-red-500 hover:bg-red-500 text-white font-bold">
          {discount}
        </Badge>

        {/* Last Chance Banner - với hiệu ứng "Trẻ em" như trong hình
        {lastChance && (
          <div className="absolute top-12 left-0">
            <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-r-full transform -skew-x-12">
              Trẻ em
            </div>
          </div>
        )}

        {/* Bottom Banner - "CƠ HỘI DUY NHẤT" */}
        {/* {lastChance && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-green-400 to-green-600 text-white text-center py-2">
            <div className="flex items-center justify-center gap-2 text-xs font-bold">
              <span>21 - 30.11</span>
              <span className="text-yellow-300">CƠ HỘI DUY NHẤT</span>
            </div>
          </div>
        )} */}

        {/* Hover overlay */}
        {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300" /> */}
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
        <div className="flex items-center gap-2 mb-3">
          {renderStars(rating)}
          <span className="text-xs text-gray-500">{reviews} đánh giá</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-bold text-red-600">{salePrice}</span>
          <span className="text-xs text-gray-400 line-through">
            {originalPrice}
          </span>
        </div>

        {/* Color Options */}
        {renderColorOptions(colors)}
      </div>
    </div>
  );
};

export default ProductCard;
