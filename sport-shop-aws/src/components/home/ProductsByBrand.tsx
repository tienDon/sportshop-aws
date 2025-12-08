import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ui/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { BrandAPI } from "@/services/brandApi";
import { ProductsAPI } from "@/services/productsApi";
import { Loader2 } from "lucide-react";

const ProductsByBrand = () => {
  const [selectedBrand, setSelectedBrand] = useState<string>("");

  // Fetch Brands
  const { data: brandData, isLoading: isLoadingBrands } = useQuery({
    queryKey: ["brands"],
    queryFn: BrandAPI.getAllBrands,
  });

  const brands = brandData?.data?.brands || [];

  // Set default selected brand
  useEffect(() => {
    if (brands.length > 0 && !selectedBrand) {
      setSelectedBrand(brands[0].slug);
    }
  }, [brands, selectedBrand]);

  // Fetch Products for selected brand
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products-by-brand", selectedBrand],
    queryFn: () => ProductsAPI.getProducts({ brand: selectedBrand }),
    enabled: !!selectedBrand,
  });

  const products = productsData?.data || [];

  if (isLoadingBrands) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className=" ">
      {/* Brand Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-8 ">
        {brands.slice(0, 4).map((brand) => (
          <Button
            key={brand._id}
            onClick={() => setSelectedBrand(brand.slug)}
            variant={selectedBrand === brand.slug ? "default" : "outline"}
            className={`px-6 py-3 rounded-full transition-all uppercase ${
              selectedBrand === brand.slug
                ? "bg-gray-900 text-white hover:bg-gray-800"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {brand.name}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      {isLoadingProducts ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 ">
          {products.length > 0 ? (
            products.map((product, index) => (
              <ProductCard
                key={product.id}
                className={index >= 4 ? "hidden xl:block" : ""}
                slug={product.slug}
                name={product.name}
                image={product.mainImageUrl || "https://placehold.co/245"}
                originalPrice={new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(Number(product.basePrice))}
                badge={product.badge}
                colors={product.colors || []}
                brand={brands.find((b) => b.slug === selectedBrand)?.name || ""}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500">
              Chưa có sản phẩm nào cho thương hiệu này.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsByBrand;
