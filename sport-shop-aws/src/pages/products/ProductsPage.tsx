import { useState } from "react";
import Header from "@/components/layout/header/Header";
import AnnouncementBanner from "@/components/layout/header/AnnouncementBanner";
import Container from "@/components/ui/Container";
import ProductListing from "@/components/products/ProductListing";
import { useProducts } from "@/hooks/useProductsQuery";
import { useProductPageLogic } from "../../hooks/useProductPageLogic";

const ProductsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const {
    apiFilters,
    breadcrumbs,
    pageTitle,
    filters,
    setFilters,
    sortBy,
    setSortBy,
  } = useProductPageLogic();

  // Use appropriate query hooks - all must be called at top level
  const { data, isLoading, error, refetch } = useProducts({
    filters: apiFilters,
    page: currentPage,
    limit,
  });

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
          title={pageTitle}
          breadcrumbItems={breadcrumbs}
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
