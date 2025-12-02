// Category types
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  banner?: string;
  parentCategory?: Category;
  level: number;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  isNavigation: boolean;
  isFeatured: boolean;
  sortOrder: number;
  productCount: number;
  subcategories?: Category[];
  createdAt: string;
  updatedAt: string;
}

// Brand types
export interface Brand {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  website?: string;
  country?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  isPremium: boolean;
  sortOrder: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariation {
  color: string;
  size: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  isDefault: boolean;
}

export interface ProductAttributes {
  color: string[];
  size: string[];
  gender: "men" | "women" | "unisex" | "kids";
  sport: string[];
  material: string[];
  features: string[];
}

export interface ProductInventory {
  inStock: boolean;
  quantity: number;
  lowStockThreshold: number;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  barcode?: string;
  category: Category;
  subcategory?: Category;
  brand: Brand;
  images: ProductImage[];
  originalPrice: number;
  salePrice?: number;
  inventory: ProductInventory;
  attributes: ProductAttributes;
  variations: ProductVariation[];
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];
  status: "draft" | "active" | "inactive" | "discontinued";
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  rating: ProductRating;
  viewCount: number;
  soldCount: number;
  sortOrder: number;
  currentPrice: number; // Virtual field
  discountPercentage: number; // Virtual field
  primaryImage?: ProductImage; // Virtual field
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

export interface CategoryResponse extends ApiResponse<Category[]> {}
export interface CategoryDetailResponse extends ApiResponse<Category> {}
export interface BrandResponse extends ApiResponse<Brand[]> {}
export interface BrandDetailResponse extends ApiResponse<Brand> {}
export interface ProductResponse extends ApiResponse<Product[]> {}
export interface ProductDetailResponse extends ApiResponse<Product> {}

// Navigation specific types
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
