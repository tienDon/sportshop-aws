import api from "@/lib/axios";
import type { Product, Category, Brand } from "@/types/api";

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
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    categories: Category[];
    brands: Brand[];
    priceRange: {
      min: number;
      max: number;
    };
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

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

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
  static async getFeaturedProducts(limit = 12): Promise<Product[]> {
    const response = await api.get(`/api/products/featured?limit=${limit}`);
    return response.data.data;
  }

  // Get new arrivals
  static async getNewArrivals(limit = 12): Promise<Product[]> {
    const response = await api.get(`/api/products/new-arrivals?limit=${limit}`);
    return response.data.data;
  }

  // Get best sellers
  static async getBestSellers(limit = 12): Promise<Product[]> {
    const response = await api.get(`/api/products/best-sellers?limit=${limit}`);
    return response.data.data;
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
  static async getProductBySlug(slug: string): Promise<Product> {
    const response = await api.get(`/api/products/slug/${slug}`);
    return response.data.data;
  }
}

export default ProductsAPI;
