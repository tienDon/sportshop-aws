import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router";
import type { ProductFilters as APIProductFilters } from "@/services/productsApi";
import {
  generateBreadcrumbs,
  generatePageTitle,
  type PageType,
} from "../utils/productPageUtils";

export const useProductPageLogic = () => {
  const { category, subcategory, subsubcategory, brand, sport } = useParams();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<APIProductFilters>({});
  const [sortBy, setSortBy] = useState("newest");

  // Get search query from URL
  const searchQuery = searchParams.get("q") || "";

  // Determine page type and build API filters
  const { pageType, apiFilters } = useMemo(() => {
    const baseFilters: APIProductFilters = { ...filters, sort_by: sortBy };

    if (category && subcategory && subsubcategory) {
      return {
        pageType: {
          type: "nested",
          category,
          subcategory,
          subsubcategory,
        } as PageType,
        apiFilters: {
          ...baseFilters,
          category: subsubcategory,
        },
      };
    }
    if (category && subcategory) {
      return {
        pageType: { type: "subcategory", category, subcategory } as PageType,
        apiFilters: { ...baseFilters, category: subcategory },
      };
    }
    if (category) {
      // Check for "new-arrivals"
      if (category === "new-arrivals") {
        return {
          pageType: { type: "badge", value: "hang-moi" } as PageType,
          apiFilters: { ...baseFilters, badge: "hang-moi" },
        };
      }

      // Check if category is actually a gender
      if (["nam", "nu", "tre-em"].includes(category)) {
        return {
          pageType: { type: "gender", value: category } as PageType,
          apiFilters: { ...baseFilters, gender: category },
        };
      }
      return {
        pageType: { type: "category", category } as PageType,
        apiFilters: { ...baseFilters, category },
      };
    }
    if (brand) {
      return {
        pageType: { type: "brand", value: brand } as PageType,
        apiFilters: { ...baseFilters, brand },
      };
    }
    if (sport) {
      return {
        pageType: { type: "sport", value: sport } as PageType,
        apiFilters: { ...baseFilters, sport },
      };
    }
    if (searchQuery) {
      return {
        pageType: { type: "search", value: searchQuery } as PageType,
        apiFilters: { ...baseFilters, search: searchQuery },
      };
    }
    return {
      pageType: { type: "all", value: "all" } as PageType,
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

  const breadcrumbs = generateBreadcrumbs(
    pageType,
    category,
    subcategory,
    subsubcategory
  );
  const pageTitle = generatePageTitle(
    pageType,
    category,
    subcategory,
    subsubcategory
  );

  return {
    pageType,
    apiFilters,
    breadcrumbs,
    pageTitle,
    filters,
    setFilters,
    sortBy,
    setSortBy,
  };
};
