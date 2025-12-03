import api from "@/lib/axios";
import type { BackendProduct } from "@/types/api";

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  gender?: string;
  sport?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  sort_by?: string;
}

export interface ProductsResponse {
  success: boolean;
  data: BackendProduct[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class ProductsAPI {
  // Get all products with filters and pagination
  static async getProducts(
    filters: ProductFilters = {},
    page = 1,
    limit = 20
  ): Promise<ProductsResponse> {
    const params = new URLSearchParams();

    // Add pagination
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    // Map filters to backend params
    if (filters.category) params.append("category_slug", filters.category);
    if (filters.brand) params.append("brand_slug", filters.brand);
    if (filters.gender) params.append("gender_slug", filters.gender);
    if (filters.sport) params.append("sport_slug", filters.sport);
    if (filters.search) params.append("q", filters.search);
    if (filters.minPrice)
      params.append("min_price", filters.minPrice.toString());
    if (filters.maxPrice)
      params.append("max_price", filters.maxPrice.toString());
    if (filters.sort_by) params.append("sort_by", filters.sort_by);

    // Handle special lists (featured, new arrivals, best sellers)
    // Note: The backend has separate endpoints for these, but if we want to filter them via getAllProducts,
    // we might need to adjust the backend or use the specific endpoints.
    // For now, let's assume getAllProducts is the main search/filter endpoint.

    const response = await api.get(`/api/products?${params}`);
    return response.data;
  }

  // Get product by slug
  static async getProductBySlug(slug: string): Promise<BackendProduct> {
    const response = await api.get(`/api/products/slug/${slug}`);
    return response.data.data;
  }
}

export default ProductsAPI;
