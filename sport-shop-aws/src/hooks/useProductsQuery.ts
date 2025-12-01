import { useQuery } from "@tanstack/react-query";
import { ProductsAPI } from "@/services/productsApi";
import type { ProductFilters } from "@/services/productsApi";

export interface UseProductsParams {
  filters?: ProductFilters;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useProducts({
  filters = {},
  page = 1,
  limit = 20,
  enabled = true,
}: UseProductsParams = {}) {
  return useQuery({
    queryKey: ["products", filters, page, limit],
    queryFn: () => ProductsAPI.getProducts(filters, page, limit),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useProductsByCategory(
  categorySlug: string,
  { filters = {}, page = 1, limit = 20, enabled = true }: UseProductsParams = {}
) {
  return useQuery({
    queryKey: ["products", "category", categorySlug, filters, page, limit],
    queryFn: () =>
      ProductsAPI.getProductsByCategory(categorySlug, filters, page, limit),
    enabled: enabled && !!categorySlug,
  });
}

export function useProductsByBrand(
  brandSlug: string,
  { filters = {}, page = 1, limit = 20, enabled = true }: UseProductsParams = {}
) {
  return useQuery({
    queryKey: ["products", "brand", brandSlug, filters, page, limit],
    queryFn: () =>
      ProductsAPI.getProductsByBrand(brandSlug, filters, page, limit),
    enabled: enabled && !!brandSlug,
  });
}

export function useSearchProducts(
  query: string,
  { filters = {}, page = 1, limit = 20, enabled = true }: UseProductsParams = {}
) {
  return useQuery({
    queryKey: ["products", "search", query, filters, page, limit],
    queryFn: () => ProductsAPI.searchProducts(query, filters, page, limit),
    enabled: enabled && !!query && query.length > 0,
  });
}

export function useFeaturedProducts(limit = 12) {
  return useQuery({
    queryKey: ["products", "featured", limit],
    queryFn: () => ProductsAPI.getFeaturedProducts(limit),
  });
}

export function useNewArrivals(limit = 12) {
  return useQuery({
    queryKey: ["products", "new-arrivals", limit],
    queryFn: () => ProductsAPI.getNewArrivals(limit),
  });
}

export function useBestSellers(limit = 12) {
  return useQuery({
    queryKey: ["products", "best-sellers", limit],
    queryFn: () => ProductsAPI.getBestSellers(limit),
  });
}
