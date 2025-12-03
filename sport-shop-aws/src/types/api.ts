// Generic API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  error?: string;
}

// Brand Type
export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  banner: string | null;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Category Type
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string | Category;
  image?: string;
  isActive: boolean;
  level: number;
  path: string;
}

// Backend Product Type (Matches API Response)
export interface BackendProduct {
  _id: string;
  name: string;
  slug: string;
  brand: {
    _id: string;
    name: string;
  };
  base_price: number;
  is_active: boolean;
  description: string | null;
  specifications: string | null;
  note: string | null;
  sports: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
  category_ids: Array<{
    _id: string;
    is_primary: boolean;
  }>;
  images: Array<{
    image_id: string;
    url: string;
    sort_order: number;
    is_main: boolean;
  }>;
  attributes: Array<{
    attr_id: string;
    value_ids: string[];
    custom_name?: string;
    custom_values?: string[];
    is_custom: boolean;
  }>;
  variants: Array<{
    variant_id: string;
    color: {
      _id: string;
      name: string;
      hex: string;
    };
    size: {
      _id: string;
      name: string;
    };
    price: number | null;
    stock_quantity: number;
    sku: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ProductBadge {
  slug: string;
  display_text: string;
  display_color: string;
}

export interface ProductSummary {
  _id: string;
  name: string;
  slug: string;
  base_price: number;
  brand: {
    _id: string;
    name: string;
  };
  main_image_url: string | null;
  badge?: ProductBadge;
}

// Navigation Types
export interface NavigationItem {
  id: string;
  name: string;
  slug: string;
}

export interface NavigationColumn {
  id: string;
  name: string;
  items: NavigationItem[];
}

export interface NavigationRoot {
  id: string;
  name: string;
  slug: string;
  type: "GENDER" | "CATEGORY" | "STATIC";
  children: NavigationColumn[];
}

export type NavigationStructure = NavigationRoot[];
