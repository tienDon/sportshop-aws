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

  // Get products by category slug
  static async getProductsByCategory(
    categorySlug: string,
    filters: Omit<ProductFilters, "category"> = {},
    page = 1,
    limit = 20
  ): Promise<ProductsResponse> {
    return this.getProducts(
      { ...filters, category: categorySlug },
      page,
      limit
    );
  }

  // Get products by brand slug
  static async getProductsByBrand(
    brandSlug: string,
    filters: Omit<ProductFilters, "brand"> = {},
    page = 1,
    limit = 20
  ): Promise<ProductsResponse> {
    return this.getProducts({ ...filters, brand: brandSlug }, page, limit);
  }

  // Get featured products
  static async getFeaturedProducts(
    limit = 12
  ): Promise<{ data: BackendProduct[]; count: number }> {
    const response = await api.get(`/api/products/featured?limit=${limit}`);
    return response.data;
  }

  // Get new arrivals
  static async getNewArrivals(
    limit = 12
  ): Promise<{ data: BackendProduct[]; count: number }> {
    const response = await api.get(`/api/products/new-arrivals?limit=${limit}`);
    return response.data;
  }

  // Get best sellers
  static async getBestSellers(
    limit = 12
  ): Promise<{ data: BackendProduct[]; count: number }> {
    const response = await api.get(`/api/products/best-sellers?limit=${limit}`);
    return response.data;
  }

  // Search products
  static async searchProducts(
    query: string,
    filters: ProductFilters = {},
    page = 1,
    limit = 20
  ): Promise<ProductsResponse> {
    return this.getProducts({ ...filters, search: query }, page, limit);
  }

  // Get product by slug
  static async getProductBySlug(slug: string): Promise<BackendProduct> {
    const response = await api.get(`/api/products/slug/${slug}`);
    return response.data.data;
  }
}

export default ProductsAPI;
