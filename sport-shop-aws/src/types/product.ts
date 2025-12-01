// Product interfaces dựa trên cấu trúc của SuperSports
export interface ProductColor {
  name: string;
  code: string;
  hex?: string;
}

export interface ProductSize {
  size: string;
  available: boolean;
  stock?: number;
}

export interface ProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface ProductReview {
  id: string;
  rating: number;
  comment: string;
  userName: string;
  date: string;
  verified?: boolean;
}

export interface ProductBadge {
  type:
    | "new"
    | "sale"
    | "bestseller"
    | "limited"
    | "blackfriday"
    | "lastchance";
  text: string;
  color: string;
}

export interface Product {
  // Thông tin cơ bản
  id: string;
  name: string;
  slug: string;
  sku?: string;

  // Giá cả
  originalPrice: string;
  salePrice?: string;
  discountPercentage?: string;
  currency: string;

  // Hình ảnh
  images: ProductImage[];
  thumbnail?: string;

  // Thông tin sản phẩm
  description?: string;
  shortDescription?: string;
  features?: string[];
  specifications?: { [key: string]: string };

  // Phân loại
  brand: string;
  category: string;
  subcategory?: string;
  subsubcategory?: string;
  sport?: string;
  gender: "nam" | "nu" | "unisex" | "tre-em";

  // Biến thể
  colors: ProductColor[];
  sizes: ProductSize[];

  // Trạng thái
  inStock: boolean;
  availableQuantity?: number;
  isNew?: boolean;
  isOnSale?: boolean;
  isFeatured?: boolean;
  isActive: boolean;

  // Badge và nhãn
  badges?: ProductBadge[];
  isBlackFriday?: boolean;
  lastChance?: boolean;

  // Đánh giá
  rating: number;
  reviewCount: number;
  reviews?: ProductReview[];

  // SEO và metadata
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];

  // Thông tin bổ sung
  weight?: string;
  dimensions?: string;
  material?: string;
  careInstructions?: string;
  origin?: string;

  // Ngày tháng
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;

  // Shipping và delivery
  freeShipping?: boolean;
  estimatedDelivery?: string;

  // Related products
  relatedProducts?: string[];
  crossSellProducts?: string[];
  upsellProducts?: string[];

  // Collection/Campaign
  collections?: string[];
  campaigns?: string[];

  // Inventory
  lowStockThreshold?: number;
  isLowStock?: boolean;
  backorderAllowed?: boolean;
}

// Enum cho các loại sắp xếp sản phẩm
export type ProductSortBy =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "rating"
  | "bestseller"
  | "name_asc"
  | "name_desc"
  | "discount";

// Interface cho filter sản phẩm
export interface ProductFilter {
  categories?: string[];
  brands?: string[];
  sports?: string[];
  gender?: string[];
  colors?: string[];
  sizes?: string[];
  priceRange?: [number, number];
  rating?: number;
  inStock?: boolean;
  isOnSale?: boolean;
  isNew?: boolean;
  collections?: string[];
}

// Interface cho kết quả search/filter
export interface ProductSearchResult {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters?: ProductFilter;
  sortBy?: ProductSortBy;
  query?: string;
}

// Interface cho cart item
export interface CartItem {
  productId: string;
  product: Product;
  selectedColor?: ProductColor;
  selectedSize?: ProductSize;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

// export default Product;
