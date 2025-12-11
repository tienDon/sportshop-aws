import api from "@/lib/axios";

export interface Brand {
  id: number;
  name: string;
  slug: string;
}

export interface Badge {
  id: number;
  name: string;
  color: string;
}

export interface Color {
  id: number;
  name: string;
  slug: string;
  hexCode: string;
}

export interface Size {
  id: number;
  name: string;
  slug: string;
}

export interface ProductVariant {
  id: number;
  productId?: number;
  colorId: number;
  sizeId?: number;
  price: number;
  stockQuantity: number;
  sku: string | null;
  imageUrls: string[] | null;
  color?: Color; // Optional - backend may not always include this
  size?: Size; // Optional - backend may not always include this
  sizeName?: string; // Some APIs return sizeName instead of size object
}

export interface AttributeValue {
  id: number;
  attributeId: number;
  value: string;
  sortOrder: number;
  attribute: {
    id: number;
    name: string;
  };
}

export interface ProductAttributeValue {
  productId: number;
  attributeValueId: number;
  attributeValue: AttributeValue;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  brandId: number;
  basePrice: number;
  mainImageUrl: string | null;
  isActive: boolean;
  description: string | null;
  specifications: string | null;
  note: string | null;
  badgeId: number | null;
  createdAt: string;
  updatedAt: string;
  brand: Brand;
  badge: Badge | null;
  _count?: {
    variants: number;
  };
  productCategories?: Array<{
    productId: number;
    categoryId: number;
    isPrimary: boolean;
    category: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  productAudiences?: Array<{
    productId: number;
    audienceId: number;
    audience: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  productSports?: Array<{
    productId: number;
    sportId: number;
    sport: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  productAttributeValues?: ProductAttributeValue[];
  variants?: ProductVariant[];
}

export interface CreateProductDTO {
  name: string;
  slug: string;
  brandId: number;
  basePrice: number;
  mainImageUrl?: string;
  isActive?: boolean;
  description?: string;
  specifications?: string;
  note?: string;
  badgeId?: number | null;
}

export interface UpdateProductDTO {
  name?: string;
  slug?: string;
  brandId?: number;
  basePrice?: number;
  mainImageUrl?: string;
  isActive?: boolean;
  description?: string;
  specifications?: string;
  note?: string;
  badgeId?: number | null;
}

export interface CreateVariantDTO {
  colorId: number;
  sizeId: number;
  price: number;
  stockQuantity: number;
  sku?: string;
  imageUrls?: string[];
}

export interface UpdateVariantDTO {
  colorId?: number;
  sizeId?: number;
  price?: number;
  stockQuantity?: number;
  sku?: string;
  imageUrls?: string[];
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const productAdminApi = {
  // Get all products for admin
  getAll: async () => {
    const { data } = await api.get<{
      success: boolean;
      data: Product[];
      pagination: PaginationInfo;
    }>("/api/products");
    return data;
  },

  // Get product by slug with full details
  // Note: API returns { success: boolean; data: Product[] } (array)
  getById: async (slug: string) => {
    try {
      console.log("API: Fetching product by slug:", slug);
      const response = await api.get<{ success: boolean; data: Product[] }>(
        `/api/products/slug/${slug}`
      );
      console.log("API: Response received:", response);
      console.log("API: Response data:", response.data);
      if (response.data?.data?.[0]) {
        const product = response.data.data[0];
        console.log("API: Product structure check:", {
          hasProductCategories: !!product.productCategories,
          productCategoriesLength: product.productCategories?.length || 0,
          hasProductAudiences: !!product.productAudiences,
          productAudiencesLength: product.productAudiences?.length || 0,
          hasProductSports: !!product.productSports,
          productSportsLength: product.productSports?.length || 0,
          productKeys: Object.keys(product),
          // Check for alternative field names
          hasCategories: 'categories' in product,
          hasAudiences: 'audiences' in product,
          hasSports: 'sports' in product,
          fullProduct: JSON.stringify(product, null, 2),
        });
      }
      // API returns array, but we expect single product, so return the structure
      // The component will handle extracting the first element
      return response.data;
    } catch (error) {
      console.error("API: Error fetching product by slug:", error);
      throw error;
    }
  },

  // Create new product
  create: async (productData: CreateProductDTO) => {
    const { data } = await api.post<{ success: boolean; data: Product }>(
      "/api/products",
      productData
    );
    return data;
  },

  // Update product
  update: async (id: number, productData: UpdateProductDTO) => {
    const { data } = await api.put<{ success: boolean; data: Product }>(
      `/api/products/${id}`,
      productData
    );
    return data;
  },

  // Delete product
  delete: async (id: number) => {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      `/api/products/${id}`
    );
    return data;
  },

  // Variant operations
  getVariants: async (productId: number) => {
    const { data } = await api.get<{
      success: boolean;
      data: ProductVariant[];
    }>(`/api/products/${productId}/variants`);
    return data;
  },

  createVariant: async (productId: number, variantData: CreateVariantDTO) => {
    const { data } = await api.post<{
      success: boolean;
      data: ProductVariant;
    }>(`/api/products/${productId}/variants`, variantData);
    return data;
  },

  updateVariant: async (
    productId: number,
    variantId: number,
    variantData: UpdateVariantDTO
  ) => {
    const { data } = await api.patch<{
      success: boolean;
      data: ProductVariant;
    }>(`/api/products/${productId}/variants/${variantId}`, variantData);
    return data;
  },

  deleteVariant: async (productId: number, variantId: number) => {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      `/api/products/${productId}/variants/${variantId}`
    );
    return data;
  },

  // Attribute values operations
  addAttributeValue: async (productId: number, attributeValueId: number) => {
    console.log("API: addAttributeValue", { productId, attributeValueId });
    try {
      const { data } = await api.post<{ success: boolean; data: any }>(
        `/api/products/${productId}/attribute-values`,
        { attributeValueId }
      );
      console.log("API: addAttributeValue success", data);
      return data;
    } catch (error: any) {
      console.error("API: addAttributeValue error", error);
      console.error("API: addAttributeValue error response", error?.response);
      throw error;
    }
  },

  // Relations operations
  addCategory: async (
    productId: number,
    categoryId: number,
    isPrimary: boolean = false
  ) => {
    console.log("API: addCategory", { productId, categoryId, isPrimary });
    try {
      const { data } = await api.post<{ success: boolean; data: any }>(
        `/api/products/${productId}/categories`,
        { categoryId, isPrimary }
      );
      console.log("API: addCategory success", data);
      return data;
    } catch (error: any) {
      console.error("API: addCategory error", error);
      console.error("API: addCategory error response", error?.response);
      throw error;
    }
  },

  addAudience: async (productId: number, audienceId: number) => {
    console.log("API: addAudience", { productId, audienceId });
    try {
      const { data } = await api.post<{ success: boolean; data: any }>(
        `/api/products/${productId}/audiences`,
        { audienceId }
      );
      console.log("API: addAudience success", data);
      return data;
    } catch (error: any) {
      console.error("API: addAudience error", error);
      console.error("API: addAudience error response", error?.response);
      throw error;
    }
  },

  addSport: async (productId: number, sportId: number) => {
    console.log("API: addSport", { productId, sportId });
    try {
      const { data } = await api.post<{ success: boolean; data: any }>(
        `/api/products/${productId}/sports`,
        { sportId }
      );
      console.log("API: addSport success", data);
      return data;
    } catch (error: any) {
      console.error("API: addSport error", error);
      console.error("API: addSport error response", error?.response);
      throw error;
    }
  },

  // Delete relations
  removeCategory: async (productId: number, categoryId: number) => {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      `/api/products/${productId}/categories/${categoryId}`
    );
    return data;
  },

  removeAudience: async (productId: number, audienceId: number) => {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      `/api/products/${productId}/audiences/${audienceId}`
    );
    return data;
  },

  removeSport: async (productId: number, sportId: number) => {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      `/api/products/${productId}/sports/${sportId}`
    );
    return data;
  },

  removeAttributeValue: async (productId: number, attributeValueId: number) => {
    const { data } = await api.delete<{ success: boolean; message: string }>(
      `/api/products/${productId}/attribute-values/${attributeValueId}`
    );
    return data;
  },
};
