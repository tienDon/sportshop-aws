import { useParams, useLocation } from "react-router";
import { useState, useEffect } from "react";
import Header from "@/components/layout/header/Header";
import AnnouncementBanner from "@/components/layout/header/AnnouncementBanner";
import Container from "@/components/ui/Container";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductsAPI from "@/services/productsApi";
import type { BackendProduct } from "@/types/api";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy breadcrumb từ state (nếu có)
  const breadcrumbFromState = location.state?.breadcrumb;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await ProductsAPI.getProductBySlug(slug);
        console.log(breadcrumbFromState);
        console.log("Product Detail Data:", data);
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Xây dựng breadcrumb
  const getBreadcrumb = () => {
    // 1. Ưu tiên dùng breadcrumb từ state (ngữ cảnh người dùng)
    if (breadcrumbFromState) {
      return [
        ...breadcrumbFromState,
        { label: product?.name || "Sản phẩm", href: "" },
      ];
    }

    // 2. Nếu không có state, fallback về breadcrumb mặc định dựa trên category chính
    const items = [{ label: "Trang chủ", href: "/" }];

    // Tìm category chính (is_primary = true) hoặc lấy cái đầu tiên
    const primaryCategory =
      product?.category_ids?.find((c) => c.is_primary) ||
      product?.category_ids?.[0];

    if (primaryCategory) {
      // TODO: Logic này có thể cải thiện nếu backend trả về full path của category
      // Hiện tại chỉ hiển thị category trực tiếp
      items.push({
        label: primaryCategory.name || "Sản phẩm",
        href: `/collections/${primaryCategory.slug}`,
      });
    } else {
      items.push({ label: "Sản phẩm", href: "/collections" });
    }

    items.push({ label: product?.name || "Chi tiết", href: "" });
    return items;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <AnnouncementBanner />
      <Container>
        <Breadcrumb items={getBreadcrumb()} />
        <div className="py-8">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p>Check console for full details</p>
        </div>
      </Container>
    </div>
  );
};

export default ProductDetailPage;
