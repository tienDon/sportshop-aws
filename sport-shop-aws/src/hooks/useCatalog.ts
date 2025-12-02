import { useState, useEffect } from "react";
import {
  CategoryAPI,
  BrandAPI,
  ProductAPI,
  NavigationAPI,
} from "@/services/catalogApi";
import type {
  Category,
  Brand,
  Product,
  NavigationStructure,
} from "@/types/api";

/**
 * Hook for navigation data
 */
export function useNavigation() {
  const [navigationData, setNavigationData] =
    useState<NavigationStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await NavigationAPI.getNavigationStructure();
        console.log("navbar data: ", data);
        setNavigationData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch navigation data"
        );
        console.error("Navigation fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNavigation();
  }, []);

  return { navigationData, loading, error, refetch: () => fetchNavigation() };
}

/**
 * Hook for categories
 */
export function useCategories(params?: {
  level?: number;
  parent?: string;
  featured?: boolean;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await CategoryAPI.getAllCategories(params);
        setCategories(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch categories"
        );
        console.error("Categories fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [params?.level, params?.parent, params?.featured]);

  return { categories, loading, error };
}

/**
 * Hook for single category
 */
export function useCategory(slug: string) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await CategoryAPI.getCategoryBySlug(slug);
        setCategory(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch category"
        );
        console.error("Category fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  return { category, loading, error };
}

/**
 * Hook for brands
 */
export function useBrands(params?: { featured?: boolean; premium?: boolean }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await BrandAPI.getAllBrands(params);
        setBrands(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch brands");
        console.error("Brands fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [params?.featured, params?.premium]);

  return { brands, loading, error };
}

/**
 * Hook for single brand
 */
export function useBrand(slug: string) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchBrand = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await BrandAPI.getBrandBySlug(slug);
        setBrand(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch brand");
        console.error("Brand fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, [slug]);

  return { brand, loading, error };
}

/**
 * Hook for products with advanced filtering and pagination
 */
export function useProducts(params?: {
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
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ProductAPI.getAllProducts(params);
        setProducts(data.products);
        setPagination({
          total: data.total,
          page: data.page,
          totalPages: data.totalPages,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch products"
        );
        console.error("Products fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    params?.category,
    params?.subcategory,
    params?.brand,
    params?.featured,
    params?.newArrival,
    params?.bestSeller,
    params?.gender,
    params?.sport,
    params?.minPrice,
    params?.maxPrice,
    params?.page,
    params?.limit,
    params?.sort,
  ]);

  return { products, pagination, loading, error };
}

/**
 * Hook for single product
 */
export function useProduct(slug: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ProductAPI.getProductBySlug(slug);
        setProduct(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch product"
        );
        console.error("Product fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  return { product, loading, error };
}

/**
 * Hook for featured products
 */
export function useFeaturedProducts(limit = 10) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ProductAPI.getFeaturedProducts(limit);
        setProducts(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch featured products"
        );
        console.error("Featured products fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [limit]);

  return { products, loading, error };
}

/**
 * Hook for new arrivals
 */
export function useNewArrivals(limit = 10) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ProductAPI.getNewArrivals(limit);
        setProducts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch new arrivals"
        );
        console.error("New arrivals fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, [limit]);

  return { products, loading, error };
}

/**
 * Hook for best sellers
 */
export function useBestSellers(limit = 10) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ProductAPI.getBestSellers(limit);
        setProducts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch best sellers"
        );
        console.error("Best sellers fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, [limit]);

  return { products, loading, error };
}

/**
 * Hook for product search
 */
export function useProductSearch(
  query: string,
  filters?: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    gender?: string;
    sport?: string;
  }
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    const searchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ProductAPI.searchProducts(query, filters);
        setProducts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to search products"
        );
        console.error("Product search error:", err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [
    query,
    filters?.category,
    filters?.brand,
    filters?.minPrice,
    filters?.maxPrice,
    filters?.gender,
    filters?.sport,
  ]);

  return { products, loading, error };
}
