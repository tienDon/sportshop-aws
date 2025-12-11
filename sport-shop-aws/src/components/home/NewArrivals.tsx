import { useQuery } from "@tanstack/react-query";
import { ProductsAPI } from "@/services/productsApi";
import ProductCard from "@/components/ui/ProductCard";
import { Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router";

const NewArrivals = () => {
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["new-arrivals"],
    queryFn: () => ProductsAPI.getProducts({}, 1, 8), // Lấy 8 sản phẩm mới nhất
  });

  const products = productsData?.data || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Sort by createdAt để lấy sản phẩm mới nhất
  const sortedProducts = [...products].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="py-12 bg-white">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full mb-4">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">Hàng Mới Về</span>
        </div>
        <h2 className="text-3xl font-bold mb-2">Sản Phẩm Mới Nhất</h2>
        <p className="text-gray-600">
          Cập nhật những sản phẩm thể thao mới nhất
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sortedProducts.slice(0, 8).map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            slug={product.slug}
            mainImageUrl={product.mainImageUrl || ""}
            basePrice={product.basePrice}
            brand={product.brand}
            badge={product.badge}
            minPrice={product.minPrice}
            maxPrice={product.maxPrice}
            variants={product.variants}
          />
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          to="/collections"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Xem Tất Cả Sản Phẩm
        </Link>
      </div>
    </div>
  );
};

export default NewArrivals;
