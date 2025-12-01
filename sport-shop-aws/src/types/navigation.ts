// Navigation types
export interface NavigationItem {
  name: string;
  href: string;
  featured?: boolean;
}

export interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export interface NavigationCategory {
  title: string;
  href: string;
  hasDropdown?: boolean;
  isSpecial?: boolean;
  dropdownContent?: NavigationSection[];
}

// Route params types
export interface CategoryParams {
  category: string;
  subcategory?: string;
  subsubcategory?: string;
}

export interface BrandParams {
  brand: string;
}

export interface SportParams {
  sport: string;
}

export interface ProductParams {
  productId: string;
}

// Filter types for products page
export interface ProductFilters {
  priceRange: [number, number];
  brands: string[];
  sizes: string[];
  colors: string[];
  sports: string[];
  categories: string[];
  inStock?: boolean;
  onSale?: boolean;
}

// URL pattern types
export type RouteType =
  | "category"
  | "brand"
  | "sport"
  | "collection"
  | "search"
  | "product";

export interface ParsedRoute {
  type: RouteType;
  category?: string;
  subcategory?: string;
  subsubcategory?: string;
  brand?: string;
  sport?: string;
  collection?: string;
  productId?: string;
  searchQuery?: string;
}
