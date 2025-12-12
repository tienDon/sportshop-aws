import { useLocation } from "react-router";
import { DashboardOverview } from "@/features/admin/dashboard/DashboardOverview";
import { BrandManager } from "@/features/admin/brands/BrandManager";
import { SportManager } from "@/features/admin/sports/SportManager";
import { ColorManager } from "@/features/admin/colors/ColorManager";
import { SizeManager } from "@/features/admin/sizes/SizeManager";
import { AttributeManager } from "@/features/admin/attributes/AttributeManager";
import { AudienceManager } from "@/features/admin/audiences/AudienceManager";
import { CategoryManager } from "@/features/admin/categories/CategoryManager";
import { ProductManager } from "@/features/admin/products/ProductManager";
import { ProductDetailPage } from "@/features/admin/products/ProductDetailPage";
import { OrderManager } from "@/features/admin/orders/OrderManager";
import { UserManager } from "@/features/admin/users/UserManager";

interface AdminDashboardContentProps {
  selectedMenu: string;
}

export function AdminDashboardContent({
  selectedMenu,
}: AdminDashboardContentProps) {
  const location = useLocation();

  // Check if we're on product detail page (using slug)
  // Pattern: /admin/products/{slug}
  // Slug có thể chứa: chữ cái, số, dấu gạch ngang, dấu gạch dưới
  // Cải thiện regex để handle URL encoding và trailing slash
  const productDetailMatch = location.pathname.match(
    /^\/admin\/products\/([^/?#]+)(?:\/)?$/
  );
  
  // Debug logging
  if (location.pathname.startsWith("/admin/products/")) {
    console.log("🔍 AdminDashboardContent - Product route detected:", {
      pathname: location.pathname,
      match: productDetailMatch,
      slug: productDetailMatch?.[1],
      selectedMenu,
    });
  }
  
  if (productDetailMatch) {
    return <ProductDetailPage />;
  }

  switch (selectedMenu) {
    case "dashboard":
      return <DashboardOverview />;
    case "orders":
      return <OrderManager />;
    case "products":
      return <ProductManager />;
    case "users":
      return <UserManager />;
    case "categories":
      return <CategoryManager />;
    case "brands":
      return <BrandManager />;
    case "sports":
      return <SportManager />;
    case "audiences":
      return <AudienceManager />;
    case "attributes":
      return <AttributeManager />;
    case "colors":
      return <ColorManager />;
    case "sizes":
      return <SizeManager />;
    default:
      return <DashboardOverview />;
  }
}
