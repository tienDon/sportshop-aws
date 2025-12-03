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
