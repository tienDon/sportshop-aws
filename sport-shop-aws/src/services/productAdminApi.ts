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
  productId: number;
  colorId: number;
  sizeId: number;
  price: number;
  stockQuantity: number;
  sku: string | null;
  imageUrls: string[] | null;
  color: Color;
  size: Size;
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

export const productAdminApi = {
  // Get all products for admin
  getAll: async () => {
    const { data } = await api.get<{ success: boolean; data: Product[] }>(
      "/api/products/admin/all"
    );
    return data;
  },

  // Get product by ID with full details
  getById: async (id: number) => {
    const { data } = await api.get<{ success: boolean; data: Product }>(
      `/api/products/${id}`
    );
    return data;
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
    const { data } = await api.post<{ success: boolean; data: any }>(
      `/api/products/${productId}/attribute-values`,
      { attributeValueId }
    );
    return data;
  },

  // Relations operations
  addCategory: async (
    productId: number,
    categoryId: number,
    isPrimary: boolean = false
  ) => {
    const { data } = await api.post<{ success: boolean; data: any }>(
      `/api/products/${productId}/categories`,
      { categoryId, isPrimary }
    );
    return data;
  },

  addAudience: async (productId: number, audienceId: number) => {
    const { data } = await api.post<{ success: boolean; data: any }>(
      `/api/products/${productId}/audiences`,
      { audienceId }
    );
    return data;
  },

  addSport: async (productId: number, sportId: number) => {
    const { data } = await api.post<{ success: boolean; data: any }>(
      `/api/products/${productId}/sports`,
      { sportId }
    );
    return data;
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
