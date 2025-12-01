import { useState, useEffect, useCallback } from "react";
import ProductsAPI, {
  type ProductFilters,
  type ProductsResponse,
} from "@/services/productsApi";
import type { Product } from "@/types/api";

export interface UseProductsOptions {
  filters?: ProductFilters;
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const { filters = {}, page = 1, limit = 20, autoFetch = true } = options;

  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(
    async (
      customFilters?: ProductFilters,
      customPage?: number,
      customLimit?: number
    ) => {
      setLoading(true);
      setError(null);

      try {
        const result = await ProductsAPI.getProducts(
          customFilters || filters,
          customPage || page,
          customLimit || limit
        );
        setData(result);
      } catch (err: any) {
        setError(err.response?.data?.message || "Lỗi tải sản phẩm");
      } finally {
        setLoading(false);
      }
    },
    [filters, page, limit]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [autoFetch, fetchProducts]);

  const refetch = useCallback(
    (newFilters?: ProductFilters, newPage?: number) => {
      return fetchProducts(newFilters, newPage);
    },
    [fetchProducts]
  );

  const loadMore = useCallback(() => {
    if (data && data.pagination.page < data.pagination.totalPages) {
      return fetchProducts(filters, data.pagination.page + 1);
    }
  }, [data, filters, fetchProducts]);

  return {
    products: data?.data || [],
    pagination: data?.pagination,
    filters: data?.filters,
    loading,
    error,
    refetch,
    loadMore,
    hasMore: data ? data.pagination.page < data.pagination.totalPages : false,
  };
};

export const useFeaturedProducts = (limit = 12) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const result = await ProductsAPI.getFeaturedProducts(limit);
        setProducts(result);
      } catch (err: any) {
        setError(err.response?.data?.message || "Lỗi tải sản phẩm nổi bật");
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, [limit]);

  return { products, loading, error };
};

export const useNewArrivals = (limit = 12) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const result = await ProductsAPI.getNewArrivals(limit);
        setProducts(result);
      } catch (err: any) {
        setError(err.response?.data?.message || "Lỗi tải hàng mới về");
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, [limit]);

  return { products, loading, error };
};

export const useBestSellers = (limit = 12) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const result = await ProductsAPI.getBestSellers(limit);
        setProducts(result);
      } catch (err: any) {
        setError(err.response?.data?.message || "Lỗi tải sản phẩm bán chạy");
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, [limit]);

  return { products, loading, error };
};

export const useProductBySlug = (slug: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const result = await ProductsAPI.getProductBySlug(slug);
        setProduct(result);
      } catch (err: any) {
        setError(err.response?.data?.message || "Lỗi tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  return { product, loading, error };
};
