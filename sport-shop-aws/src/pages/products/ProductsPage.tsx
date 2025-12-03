import { useParams, useSearchParams } from "react-router";
import { useState, useMemo } from "react";
import Header from "@/components/layout/header/Header";
import AnnouncementBanner from "@/components/layout/header/AnnouncementBanner";
import Container from "@/components/ui/Container";
import ProductListing from "@/components/products/ProductListing";
import { useProducts } from "@/hooks/useProductsQuery";
import type { ProductFilters as APIProductFilters } from "@/services/productsApi";

const ProductsPage = () => {
  const { category, subcategory, subsubcategory, brand, sport } = useParams();
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<APIProductFilters>({});
  const [sortBy, setSortBy] = useState("newest");
  const limit = 20;

  // Get search query from URL
  const searchQuery = searchParams.get("q") || "";

  // Determine page type and build API filters
  const { pageType, apiFilters } = useMemo(() => {
    const baseFilters: APIProductFilters = { ...filters, sort_by: sortBy };

    if (category && subcategory && subsubcategory) {
      return {
        pageType: { type: "nested", category, subcategory, subsubcategory },
        apiFilters: {
          ...baseFilters,
          category: subsubcategory,
        },
      };
    }
    if (category && subcategory) {
      return {
        pageType: { type: "subcategory", category, subcategory },
        apiFilters: { ...baseFilters, category: subcategory },
      };
    }
    if (category) {
      // Check for "new-arrivals"
      if (category === "new-arrivals") {
        return {
          pageType: { type: "badge", value: "hang-moi" },
          apiFilters: { ...baseFilters, badge: "hang-moi" },
        };
      }

      // Check if category is actually a gender
      if (["nam", "nu", "tre-em"].includes(category)) {
        return {
          pageType: { type: "gender", value: category },
          apiFilters: { ...baseFilters, gender: category },
        };
      }
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
    sortBy,
  ]);

  // Use appropriate query hooks - all must be called at top level
  const { data, isLoading, error, refetch } = useProducts({
    filters: apiFilters,
    page: currentPage,
    limit,
  });

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
    } else if (pageType.type === "gender") {
      const label =
        pageType.value === "nam"
          ? "Nam"
          : pageType.value === "nu"
          ? "Nữ"
          : "Trẻ em";
      items.push({ label, href: "" });
    } else if (pageType.type === "brand") {
      items.push({ label: pageType.value?.toUpperCase() || "", href: "" });
    } else if (pageType.type === "badge") {
      if (pageType.value === "hang-moi") {
        items.push({ label: "Hàng Mới", href: "" });
      } else {
        items.push({ label: pageType.value || "", href: "" });
      }
    } else if (pageType.type === "sport") {
      items.push({ label: pageType.value || "", href: "" });
    } else if (pageType.type === "search") {
      items.push({ label: `Tìm kiếm: "${pageType.value}"`, href: "" });
    }

    return items;
  };

  // Lọc sản phẩm dựa trên URL params và filters - bây giờ được handle bởi API
  const getPageTitle = () => {
    if (pageType.type === "gender") {
      return pageType.value === "nam"
        ? "Sản phẩm Nam"
        : pageType.value === "nu"
        ? "Sản phẩm Nữ"
        : "Sản phẩm Trẻ em";
    } else if (pageType.type === "category") {
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
    } else if (pageType.type === "badge") {
      if (pageType.value === "hang-moi") return "Hàng Mới Về";
      return `Sản phẩm ${pageType.value}`;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AnnouncementBanner />

      <Container>
        <ProductListing
          title={getPageTitle()}
          breadcrumbItems={getBreadcrumb()}
          filters={filters}
          onFiltersChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
          data={data}
          isLoading={isLoading}
          error={error}
          onPageChange={handlePageChange}
          onRefetch={refetch}
        />
      </Container>
    </div>
  );
};

export default ProductsPage;
