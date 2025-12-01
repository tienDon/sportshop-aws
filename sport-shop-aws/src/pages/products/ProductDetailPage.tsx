import { useParams } from "react-router";
import { useState, useEffect } from "react";
import Header from "@/components/layout/header/Header";
import AnnouncementBanner from "@/components/layout/header/AnnouncementBanner";
import Container from "@/components/ui/Container";
import type { Product } from "@/types/product";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call để lấy chi tiết sản phẩm
    setTimeout(() => {
      const mockProduct: Product = {
        id: productId || "1",
        name: "Giày Luyện Tập Nam Nike Reax 8 TR Mesh Silver",
        slug: "giay-luyen-tap-nam-nike-reax-8-tr-mesh-silver",
        originalPrice: "2.749.000",
        salePrice: "1.374.500",
        discountPercentage: "-50%",
        currency: "VND",
        images: [
          {
            url: "https://placehold.co/600x600",
            alt: "Nike Reax 8 TR Mesh Silver",
            isPrimary: true,
          },
        ],
        description:
          "Giày luyện tập Nike Reax 8 TR Mesh được thiết kế với công nghệ tiên tiến, mang lại sự thoải mái và hỗ trợ tối ưu cho mọi hoạt động thể thao. Phần upper mesh thoáng khí kết hợp với đế Nike Reax đặc trưng tạo nên sự linh hoạt và bền bỉ.",
        shortDescription: "Giày luyện tập cao cấp với công nghệ Nike Reax",
        features: [
          "Upper mesh thoáng khí",
          "Công nghệ Nike Reax hỗ trợ vận động",
          "Đế ngoài cao su bền chắc",
          "Thiết kế năng động, hiện đại",
        ],
        brand: "Nike",
        category: "nam",
        subcategory: "giay-tap-luyen",
        sport: "gym",
        gender: "nam",
        colors: [
          { name: "Metallic Silver", code: "silver", hex: "#C0C0C0" },
          { name: "Black", code: "black", hex: "#000000" },
        ],
        sizes: [
          { size: "40", available: true, stock: 5 },
          { size: "41", available: true, stock: 3 },
          { size: "42", available: true, stock: 7 },
          { size: "43", available: true, stock: 2 },
          { size: "44", available: false, stock: 0 },
        ],
        inStock: true,
        availableQuantity: 17,
        isOnSale: true,
        rating: 4.5,
        reviewCount: 24,
        badges: [
          { type: "sale", text: "SALE 50%", color: "red" },
          { type: "blackfriday", text: "Black Friday", color: "black" },
        ],
        isBlackFriday: true,
        lastChance: false,
        isActive: true,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-11-29T00:00:00Z",
        freeShipping: true,
        estimatedDelivery: "2-3 ngày",
      };
      setProduct(mockProduct);
      setLoading(false);
    }, 500);
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <AnnouncementBanner />
        <Container>
          <div className="text-center py-12">
            <p>Đang tải sản phẩm...</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AnnouncementBanner />

      <Container>
        <div className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square bg-white rounded-lg overflow-hidden">
                <img
                  src={product?.images[0]?.url}
                  alt={product?.images[0]?.alt || product?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product?.images && product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className="w-20 h-20 bg-white rounded overflow-hidden"
                    >
                      <img
                        src={image.url}
                        alt={image.alt || `${product.name} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Badges */}
              {product?.badges && product.badges.length > 0 && (
                <div className="flex gap-2">
                  {product.badges.map((badge, index) => (
                    <span
                      key={index}
                      className={`px-2 py-1 text-xs font-semibold text-white rounded ${
                        badge.type === "sale"
                          ? "bg-red-500"
                          : badge.type === "blackfriday"
                          ? "bg-black"
                          : badge.type === "new"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                      }`}
                    >
                      {badge.text}
                    </span>
                  ))}
                </div>
              )}

              {/* Brand */}
              <div className="text-sm text-gray-600 uppercase tracking-wider">
                {product?.brand}
              </div>

              {/* Name */}
              <h1 className="text-3xl font-bold text-gray-900">
                {product?.name}
              </h1>

              {/* Price */}
              <div className="flex items-center gap-4">
                {product?.salePrice ? (
                  <>
                    <span className="text-3xl font-bold text-red-600">
                      {product.salePrice.toLocaleString()}₫
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {product.originalPrice.toLocaleString()}₫
                    </span>
                    {product.discountPercentage && (
                      <span className="bg-red-100 text-red-800 text-sm font-semibold px-2 py-1 rounded">
                        {product.discountPercentage}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-3xl font-bold text-gray-900">
                    {product?.originalPrice.toLocaleString()}₫
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i}>
                      {i < Math.floor(product?.rating || 0) ? "★" : "☆"}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({product?.reviewCount} đánh giá)
                </span>
              </div>

              {/* Description */}
              <div className="prose prose-sm">
                <p>{product?.description}</p>
              </div>

              {/* Features */}
              {product?.features && product.features.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tính năng nổi bật:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Colors */}
              {product?.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Màu sắc:</h3>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color.code}
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {product?.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Kích thước:</h3>
                  <div className="grid grid-cols-5 gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size.size}
                        disabled={!size.available}
                        className={`p-2 border rounded text-sm ${
                          size.available
                            ? "border-gray-300 hover:border-gray-500"
                            : "border-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {size.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <div className="flex gap-4">
                <button className="flex-1 bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors">
                  Thêm vào giỏ hàng
                </button>
                <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  ♡
                </button>
              </div>

              {/* Shipping Info */}
              {product?.freeShipping && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <span>🚚</span>
                    <span className="font-medium">Miễn phí giao hàng</span>
                  </div>
                  {product.estimatedDelivery && (
                    <p className="text-sm text-green-600 mt-1">
                      Dự kiến giao hàng: {product.estimatedDelivery}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProductDetailPage;
