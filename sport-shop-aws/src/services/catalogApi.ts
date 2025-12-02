import api from "@/lib/axios";
import type {
  Category,
  Brand,
  Product,
  CategoryResponse,
  CategoryDetailResponse,
  BrandResponse,
  BrandDetailResponse,
  ProductResponse,
  ProductDetailResponse,
  NavigationStructure,
  ApiResponse,
} from "@/types/api";

/**
 * Category API Service
 */
export class CategoryAPI {
  // Get navigation categories (hierarchical structure for menu)
  static async getNavigationCategories(): Promise<Category[]> {
    const response = await api.get("/api/categories/navigation");
    return response.data.data;
  }

  // Get category tree (all categories in hierarchical structure)
  static async getCategoryTree(): Promise<any[]> {
    const response = await api.get("/api/categories/tree");
    return response.data.data;
  }

  // Get all categories with optional filters
  static async getAllCategories(params?: {
    level?: number;
    parent?: string;
    featured?: boolean;
    active?: boolean;
  }): Promise<Category[]> {
    const response = await api.get("/api/categories", { params });
    return response.data.data;
  }

  // Get category by slug
  static async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await api.get(`/api/categories/slug/${slug}`);
    return response.data.data;
  }

  // Get category by ID
  static async getCategoryById(id: string): Promise<Category> {
    const response = await api.get(`/api/categories/${id}`);
    return response.data.data;
  }

  // Get main categories (level 0)
  static async getMainCategories(): Promise<Category[]> {
    return this.getAllCategories({ level: 0, active: true });
  }

  // Get subcategories of a parent
  static async getSubcategories(parentId: string): Promise<Category[]> {
    return this.getAllCategories({ parent: parentId, active: true });
  }

  // Get featured categories
  static async getFeaturedCategories(): Promise<Category[]> {
    return this.getAllCategories({ featured: true, active: true });
  }
}

/**
 * Brand API Service
 */
export class BrandAPI {
  // Get all brands with optional filters
  static async getAllBrands(params?: {
    featured?: boolean;
    premium?: boolean;
    active?: boolean;
  }): Promise<Brand[]> {
    const response = await api.get("/api/brands", { params });
    return response.data.data;
  }

  // Get brand by slug
  static async getBrandBySlug(slug: string): Promise<Brand> {
    const response = await api.get(`/api/brands/slug/${slug}`);
    return response.data.data;
  }

  // Get brand by ID
  static async getBrandById(id: string): Promise<Brand> {
    const response = await api.get(`/api/brands/${id}`);
    return response.data.data;
  }

  // Get featured brands
  static async getFeaturedBrands(): Promise<Brand[]> {
    return this.getAllBrands({ featured: true, active: true });
  }

  // Get premium brands
  static async getPremiumBrands(): Promise<Brand[]> {
    return this.getAllBrands({ premium: true, active: true });
  }
}

/**
 * Product API Service
 */
export class ProductAPI {
  // Get all products with optional filters
  static async getAllProducts(params?: {
    category?: string;
    subcategory?: string;
    brand?: string;
    featured?: boolean;
    newArrival?: boolean;
    bestSeller?: boolean;
    gender?: string;
    sport?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sort?: string;
  }): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await api.get("/api/products", { params });
    return response.data;
  }

  // Get product by slug
  static async getProductBySlug(slug: string): Promise<Product> {
    const response = await api.get(`/api/products/slug/${slug}`);
    return response.data.data;
  }

  // Get product by ID
  static async getProductById(id: string): Promise<Product> {
    const response = await api.get(`/api/products/${id}`);
    return response.data.data;
  }

  // Get featured products
  static async getFeaturedProducts(limit = 10): Promise<Product[]> {
    const response = await api.get("/api/products/featured", {
      params: { limit },
    });
    return response.data.data;
  }

  // Get new arrivals
  static async getNewArrivals(limit = 10): Promise<Product[]> {
    const response = await api.get("/api/products/new-arrivals", {
      params: { limit },
    });
    return response.data.data;
  }

  // Get best sellers
  static async getBestSellers(limit = 10): Promise<Product[]> {
    const response = await api.get("/api/products/best-sellers", {
      params: { limit },
    });
    return response.data.data;
  }

  // Search products
  static async searchProducts(
    query: string,
    filters?: {
      category?: string;
      brand?: string;
      minPrice?: number;
      maxPrice?: number;
      gender?: string;
      sport?: string;
    }
  ): Promise<Product[]> {
    const response = await api.get("/api/products/search", {
      params: { q: query, ...filters },
    });
    return response.data.data;
  }

  // Get products by category
  static async getProductsByCategory(
    categorySlug: string,
    params?: {
      subcategory?: string;
      brand?: string;
      page?: number;
      limit?: number;
      sort?: string;
    }
  ): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await api.get(`/api/products/category/${categorySlug}`, {
      params,
    });
    return response.data;
  }

  // Get products by brand
  static async getProductsByBrand(
    brandSlug: string,
    params?: {
      category?: string;
      page?: number;
      limit?: number;
      sort?: string;
    }
  ): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await api.get(`/api/products/brand/${brandSlug}`, {
      params,
    });
    return response.data;
  }
}

/**
 * Navigation API Service - Combines categories and brands for navigation
 */
export class NavigationAPI {
  // Get complete navigation structure
  static async getNavigationStructure(): Promise<NavigationStructure> {
    const response = await api.get("/api/navigation/main");
    return response.data.data;
  }

  // Get navigation data for specific category
  static async getCategoryNavigation(categorySlug: string) {
    const category = await CategoryAPI.getCategoryBySlug(categorySlug);
    const subcategories = category.subcategories || [];

    return {
      category,
      subcategories,
    };
  }
}

// Default export with all services
export default {
  Category: CategoryAPI,
  Brand: BrandAPI,
  Product: ProductAPI,
  Navigation: NavigationAPI,
};
