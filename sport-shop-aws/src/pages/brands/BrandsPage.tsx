import { Link } from "react-router";
import Header from "@/components/layout/header/Header";
import AnnouncementBanner from "@/components/layout/header/AnnouncementBanner";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { BrandAPI } from "@/services/catalogApi";
import type { Brand } from "@/types/api";

const BrandsPage = () => {
  // Fetch featured brands
  const {
    data: featuredBrands,
    isLoading: featuredLoading,
    error: featuredError,
  } = useQuery({
    queryKey: ["brands", "featured"],
    queryFn: () => BrandAPI.getFeaturedBrands(),
  });

  // Fetch all brands
  const {
    data: allBrands,
    isLoading: allBrandsLoading,
    error: allBrandsError,
  } = useQuery({
    queryKey: ["brands", "all"],
    queryFn: () => BrandAPI.getAllBrands({ active: true }),
  });

  // Get non-featured brands (other brands)
  const otherBrands =
    allBrands?.filter((brand: Brand) => !brand.isFeatured) || [];

  const isLoading = featuredLoading || allBrandsLoading;
  const error = featuredError || allBrandsError;

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
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            TẤT CẢ THƯƠNG HIỆU
          </h1>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse delay-75"></div>
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse delay-150"></div>
            </div>
            <p className="mt-4 text-gray-600">
              Đang tải danh sách thương hiệu...
            </p>
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

        {!isLoading && !error && (
          <div className="space-y-12">
            {/* Featured Brands Section - SuperSports Style */}
            {featuredBrands && featuredBrands.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 uppercase">
                  THƯƠNG HIỆU NỔI BẬT
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {featuredBrands.map((brand: Brand) => (
                    <Link
                      key={brand._id}
                      to={`/collections/${brand.slug}`}
                      className="group"
                    >
                      <div className="bg-white rounded-lg p-4 hover:shadow-md transition-all duration-300 border border-gray-100 group-hover:border-red-200">
                        <div className="aspect-square flex items-center justify-center bg-white rounded-lg overflow-hidden">
                          <img
                            src={
                              brand.logo ||
                              `https://placehold.co/150x150/ffffff/000000?text=${brand.name.replace(
                                /\s+/g,
                                "+"
                              )}`
                            }
                            alt={brand.name}
                            className="w-full h-full object-contain p-2"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Other Brands Section - SuperSports Style */}
            {otherBrands && otherBrands.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 uppercase">
                  THƯƠNG HIỆU KHÁC
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {otherBrands.map((brand: Brand) => (
                    <Link
                      key={brand._id}
                      to={`/collections/${brand.slug}`}
                      className="group"
                    >
                      <div className="bg-white rounded-lg p-4 hover:shadow-md transition-all duration-300 border border-gray-100 group-hover:border-red-200">
                        <div className="aspect-square flex items-center justify-center bg-white rounded-lg overflow-hidden">
                          <img
                            src={
                              brand.logo ||
                              `https://placehold.co/150x150/ffffff/000000?text=${brand.name.replace(
                                /\s+/g,
                                "+"
                              )}`
                            }
                            alt={brand.name}
                            className="w-full h-full object-contain p-2"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
};

export default BrandsPage;
