import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ui/ProductCard";

// Fake data cho sản phẩm
const productsData = {
  nike: [
    {
      id: 1,
      name: "Giày Luyện Tập Nam Nike Reax 8 TR Mesh Silver",
      image: "https://placehold.co/245",
      originalPrice: "2.749.000đ",
      salePrice: "1.374.500đ",
      discount: "-50%",
      rating: 4.5,
      reviews: 4,
      colors: ["gray", "black"],
      isBlackFriday: true,
      lastChance: true,
    },
    {
      id: 2,
      name: "Giày Golf Nam Nike Air Zoom Infinity Tour 2 Wide",
      image: "https://placehold.co/245",
      originalPrice: "6.499.000đ",
      salePrice: "3.249.500đ",
      discount: "-50%",
      rating: 4.0,
      reviews: 2,
      colors: ["black", "brown"],
      isBlackFriday: true,
      lastChance: true,
    },
    // Thêm sản phẩm Nike khác...
  ],
  adidas: [
    {
      id: 3,
      name: "Giày Thể Thao Adidas Ultraboost 22",
      image: "https://placehold.co/245x245",
      originalPrice: "4.500.000đ",
      salePrice: "2.250.000đ",
      discount: "-50%",
      rating: 4.8,
      reviews: 12,
      colors: ["white", "black"],
      isBlackFriday: true,
      lastChance: false,
    },
    // Thêm sản phẩm Adidas khác...
  ],
  puma: [
    {
      id: 4,
      name: "Giày Chạy Bộ Puma Velocity Nitro 3",
      image: "https://placehold.co/245x245",
      originalPrice: "3.200.000đ",
      salePrice: "1.600.000đ",
      discount: "-50%",
      rating: 4.3,
      reviews: 8,
      colors: ["blue", "red"],
      isBlackFriday: true,
      lastChance: true,
    },
    // Thêm sản phẩm Puma khác...
  ],
  columbia: [
    {
      id: 5,
      name: "Áo Khoác Columbia Windbreaker",
      image: "https://placehold.co/245x245",
      originalPrice: "2.800.000đ",
      salePrice: "1.400.000đ",
      discount: "-50%",
      rating: 4.6,
      reviews: 15,
      colors: ["navy", "green"],
      isBlackFriday: true,
      lastChance: false,
    },
    // Thêm sản phẩm Columbia khác...
  ],
};

const brands = [
  { id: "nike", name: "NIKE", label: "SIÊU ƯU ĐÃI", active: true },
  { id: "adidas", name: "ADIDAS", label: "DEAL HỪNG NHÁ MUA", active: false },
  { id: "puma", name: "UA", label: "GIÁ TỐT NHẤT NĂM", active: false },
  { id: "columbia", name: "COLUMBIA", label: "SALE CỰC SỐC", active: false },
];

const ProductsByBrand = () => {
  const [selectedBrand, setSelectedBrand] = useState("nike");
  const [brandButtons, setBrandButtons] = useState(brands);

  const handleBrandClick = (brandId: string) => {
    setSelectedBrand(brandId);
    setBrandButtons(
      brandButtons.map((brand) => ({
        ...brand,
        active: brand.id === brandId,
      }))
    );
  };

  const currentProducts =
    productsData[selectedBrand as keyof typeof productsData] || [];

  return (
    <div className=" ">
      {/* Brand Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 ">
        {brandButtons.map((brand) => (
          <Button
            key={brand.id}
            onClick={() => handleBrandClick(brand.id)}
            variant={brand.active ? "default" : "outline"}
            className={`px-6 py-3 rounded-full transition-all ${
              brand.active
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {brand.name} - {brand.label}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 ">
        {currentProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            image={product.image}
            originalPrice={product.originalPrice}
            salePrice={product.salePrice}
            discount={product.discount}
            rating={product.rating}
            reviews={product.reviews}
            colors={product.colors}
            isBlackFriday={product.isBlackFriday}
            lastChance={product.lastChance}
            brand={brandButtons.find((b) => b.id === selectedBrand)?.name || ""}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductsByBrand;
