import { Link } from "react-router";
import Header from "@/components/layout/header/Header";
import AnnouncementBanner from "@/components/layout/header/AnnouncementBanner";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { BrandAPI } from "@/services/catalogApi";
import type { Brand } from "@/types/api";
import { Skeleton } from "@/components/ui/skeleton";

const BrandsPage = () => {
  // Fetch all brands
  const {
    data: brands,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["brands", "all"],
    queryFn: () => BrandAPI.getAllBrands({ active: true }),
  });

  const breadcrumbItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Thương hiệu", href: "" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AnnouncementBanner />

      <Container>
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Header */}
        <div className="py-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 uppercase">
            Thương Hiệu
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Khám phá các thương hiệu thể thao hàng đầu thế giới tại SuperSports
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 flex flex-col items-center space-y-4"
              >
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">
              Có lỗi xảy ra khi tải danh sách thương hiệu
            </p>
          </div>
        )}

        {/* Brands Grid */}
        {!isLoading && !error && brands && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16">
            {brands.map((brand: Brand) => (
              <Link
                key={brand._id}
                to={`/brands/${brand.slug}`}
                className="group block h-full"
              >
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-red-200 transition-all duration-300 h-full flex flex-col items-center text-center">
                  {/* Logo Area */}
                  <div className="w-32 h-32 mb-6 flex items-center justify-center bg-gray-50 rounded-full group-hover:bg-white transition-colors duration-300 overflow-hidden p-4">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-gray-400 group-hover:text-red-500 transition-colors">
                        {brand.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 flex flex-col items-center w-full">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                      {brand.name}
                    </h3>

                    {brand.description ? (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                        {brand.description}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic mb-4">
                        Thương hiệu thể thao chính hãng
                      </p>
                    )}

                    <span className="mt-auto text-sm font-medium text-red-600 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      Xem sản phẩm &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default BrandsPage;
