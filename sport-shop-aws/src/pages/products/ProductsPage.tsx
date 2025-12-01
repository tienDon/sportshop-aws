import { useParams, useSearchParams } from "react-router";
import { useState, useMemo } from "react";
import Header from "@/components/layout/header/Header";
import AnnouncementBanner from "@/components/layout/header/AnnouncementBanner";
import Container from "@/components/ui/Container";
import ProductCard from "@/components/ui/ProductCard";
import ProductFilters from "@/components/products/ProductFilters";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductSort from "@/components/products/ProductSort";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  useProducts,
  useProductsByCategory,
  useProductsByBrand,
  useSearchProducts,
} from "@/hooks/useProductsQuery";
import type { ProductFilters as APIProductFilters } from "@/services/productsApi";

const ProductsPage = () => {
  const { category, subcategory, subsubcategory, brand, sport } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<APIProductFilters>({});
  const [sortBy, setSortBy] = useState("newest");
  const limit = 20;

  // Get search query from URL
  const searchQuery = searchParams.get("q") || "";

  // Determine page type and build API filters
  const { pageType, apiFilters } = useMemo(() => {
    const baseFilters: APIProductFilters = { ...filters };

    if (category && subcategory && subsubcategory) {
      return {
        pageType: { type: "nested", category, subcategory, subsubcategory },
        apiFilters: {
          ...baseFilters,
          category: `${category}/${subcategory}/${subsubcategory}`,
        },
      };
    }
    if (category && subcategory) {
      return {
        pageType: { type: "subcategory", category, subcategory },
        apiFilters: { ...baseFilters, category: `${category}/${subcategory}` },
      };
    }
    if (category) {
      return {
        pageType: { type: "category", category },
        apiFilters: { ...baseFilters, category },
      };
    }
    if (brand) {
      return {
        pageType: { type: "brand", value: brand },
        apiFilters: { ...baseFilters, brand },
      };
    }
    if (sport) {
      return {
        pageType: { type: "sport", value: sport },
        apiFilters: { ...baseFilters, sport },
      };
    }
    if (searchQuery) {
      return {
        pageType: { type: "search", value: searchQuery },
        apiFilters: { ...baseFilters, search: searchQuery },
      };
    }
    return {
      pageType: { type: "all", value: "all" },
      apiFilters: baseFilters,
    };
  }, [
    category,
    subcategory,
    subsubcategory,
    brand,
    sport,
    searchQuery,
    filters,
  ]);

  // Use appropriate query hooks - all must be called at top level
  const allProductsQuery = useProducts({
    filters: apiFilters,
    page: currentPage,
    limit,
    enabled: pageType.type === "all",
  });

  const categoryProductsQuery = useProductsByCategory(
    apiFilters.category || "",
    {
      filters: apiFilters,
      page: currentPage,
      limit,
      enabled:
        pageType.type === "category" ||
        pageType.type === "subcategory" ||
        pageType.type === "nested",
    }
  );

  const brandProductsQuery = useProductsByBrand(pageType.value || "", {
    filters: apiFilters,
    page: currentPage,
    limit,
    enabled: pageType.type === "brand",
  });

  const searchProductsQuery = useSearchProducts(pageType.value || "", {
    filters: apiFilters,
    page: currentPage,
    limit,
    enabled: pageType.type === "search",
  });

  // Select the correct query result based on page type
  const { data, isLoading, error } = useMemo(() => {
    switch (pageType.type) {
      case "brand":
        return brandProductsQuery;
      case "search":
        return searchProductsQuery;
      case "category":
      case "subcategory":
      case "nested":
        return categoryProductsQuery;
      default:
        return allProductsQuery;
    }
  }, [
    pageType.type,
    allProductsQuery,
    categoryProductsQuery,
    brandProductsQuery,
    searchProductsQuery,
  ]);

  // Xác định loại page dựa trên URL
  const getPageType = () => {
    return pageType;
  };

  // Tạo breadcrumb dựa trên page type
  const getBreadcrumb = () => {
    const items = [{ label: "Trang chủ", href: "/" }];

    if (
      pageType.type === "category" ||
      pageType.type === "subcategory" ||
      pageType.type === "nested"
    ) {
      // Collections base
      items.push({ label: "Collections", href: "/collections" });

      // Category level
      if (category) {
        const categoryLabel =
          category === "nam"
            ? "Nam"
            : category === "nu"
            ? "Nữ"
            : category === "tre-em"
            ? "Trẻ em"
            : category.charAt(0).toUpperCase() + category.slice(1);
        items.push({
          label: categoryLabel,
          href: pageType.type === "category" ? "" : `/collections/${category}`,
        });
      }

      // Subcategory level
      if (subcategory) {
        const subcategoryLabel = subcategory
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        items.push({
          label: subcategoryLabel,
          href:
            pageType.type === "subcategory"
              ? ""
              : `/collections/${category}/${subcategory}`,
        });
      }

      // Subsubcategory level
      if (subsubcategory) {
        const subsubcategoryLabel = subsubcategory
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        items.push({ label: subsubcategoryLabel, href: "" });
      }
    } else if (pageType.type === "brand") {
      items.push({ label: pageType.value?.toUpperCase() || "", href: "" });
    } else if (pageType.type === "sport") {
      items.push({ label: pageType.value || "", href: "" });
    } else if (pageType.type === "search") {
      items.push({ label: `Tìm kiếm: "${pageType.value}"`, href: "" });
    }

    return items;
  };

  // Lọc sản phẩm dựa trên URL params và filters - bây giờ được handle bởi API
  const getPageTitle = () => {
    if (pageType.type === "category") {
      return category === "nam"
        ? "Sản phẩm Nam"
        : category === "nu"
        ? "Sản phẩm Nữ"
        : category === "tre-em"
        ? "Sản phẩm Trẻ em"
        : `Sản phẩm ${category}`;
    } else if (pageType.type === "subcategory") {
      const subcategoryLabel =
        subcategory
          ?.replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()) || "";
      return `${subcategoryLabel} - ${
        category === "nam" ? "Nam" : category === "nu" ? "Nữ" : "Trẻ em"
      }`;
    } else if (pageType.type === "nested") {
      const subsubcategoryLabel =
        subsubcategory
          ?.replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()) || "";
      return subsubcategoryLabel;
    } else if (pageType.type === "brand") {
      return `Sản phẩm ${pageType.value?.toUpperCase()}`;
    } else if (pageType.type === "sport") {
      return `Sản phẩm ${pageType.value}`;
    } else if (pageType.type === "search") {
      return `Kết quả tìm kiếm: "${pageType.value}"`;
    }
    return "Tất cả sản phẩm";
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    if (!data?.pagination) return [];

    const { page, totalPages } = data.pagination;
    const items = [];
    const delta = 2; // Show 2 pages before and after current page

    for (
      let i = Math.max(1, page - delta);
      i <= Math.min(totalPages, page + delta);
      i++
    ) {
      items.push(i);
    }

    return items;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AnnouncementBanner />

      <Container>
        {/* Breadcrumb */}
        <Breadcrumb items={getBreadcrumb()} />

        {/* Page Header */}
        <div className="py-6">
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
          <p className="text-gray-600 mt-2">
            {data?.pagination?.total || 0} sản phẩm
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-1/4">
            <ProductFilters filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Main Content */}
          <div className="w-3/4">
            {/* Sort Options */}
            <ProductSort sortBy={sortBy} onSortChange={setSortBy} />

            {/* Products Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-75"></div>
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-150"></div>
                </div>
                <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Có lỗi xảy ra khi tải sản phẩm</p>
                <button
                  onClick={() => {
                    // Refetch the appropriate query
                    switch (pageType.type) {
                      case "brand":
                        brandProductsQuery.refetch();
                        break;
                      case "search":
                        searchProductsQuery.refetch();
                        break;
                      case "category":
                      case "subcategory":
                      case "nested":
                        categoryProductsQuery.refetch();
                        break;
                      default:
                        allProductsQuery.refetch();
                    }
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Thử lại
                </button>
              </div>
            ) : data?.data?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Không tìm thấy sản phẩm nào</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                {data?.data?.map((product) => (
                  <ProductCard
                    key={product._id}
                    id={parseInt(product._id)}
                    name={product.name}
                    image={product.images?.[0]?.url || ""}
                    originalPrice={`${product.originalPrice?.toLocaleString()}₫`}
                    salePrice={
                      product.salePrice
                        ? `${product.salePrice.toLocaleString()}₫`
                        : ""
                    }
                    discount={
                      product.originalPrice && product.salePrice
                        ? `-${Math.round(
                            ((product.originalPrice - product.salePrice) /
                              product.originalPrice) *
                              100
                          )}%`
                        : ""
                    }
                    rating={product.rating?.average || 0}
                    reviews={product.rating?.count || 0}
                    colors={product.attributes?.color || []}
                    isBlackFriday={product.isBlackFriday || false}
                    brand={product.brand?.name || ""}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex justify-center mt-12">
                <Pagination>
                  <PaginationContent>
                    {data.pagination.page > 1 && (
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(data.pagination.page - 1);
                          }}
                        />
                      </PaginationItem>
                    )}

                    {data.pagination.page > 3 && (
                      <>
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(1);
                            }}
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {data.pagination.page > 4 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                      </>
                    )}

                    {generatePaginationItems().map((pageNumber) => (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          isActive={pageNumber === data.pagination.page}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNumber);
                          }}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    {data.pagination.page < data.pagination.totalPages - 2 && (
                      <>
                        {data.pagination.page <
                          data.pagination.totalPages - 3 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(data.pagination.totalPages);
                            }}
                          >
                            {data.pagination.totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    {data.pagination.page < data.pagination.totalPages && (
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(data.pagination.page + 1);
                          }}
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
};

export default ProductsPage;
