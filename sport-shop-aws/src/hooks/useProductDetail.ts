import { useState, useEffect, useMemo, useCallback } from "react";
import ProductsAPI from "@/services/productsApi";
import type { BackendProduct, Variant, Color, Size } from "@/types/api";

// ... Khai báo các types cần thiết (BackendProduct, Variant, Color, Size) ...

export const useProductDetail = (slug?: string) => {
  // --- A. State Fetching Dữ liệu ---
  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- B. State Lựa chọn của Người dùng (Selection State) ---
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // 1. Logic Fetching Data (Giữ nguyên)
  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      // Reset trạng thái lựa chọn khi load sản phẩm mới
      setSelectedColorId(null);
      setSelectedSizeId(null);
      setQuantity(1);

      try {
        setLoading(true);
        setError(null);
        const data = await ProductsAPI.getProductBySlug(slug);
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    void fetchProduct();
  }, [slug]);

  // 2. Logic Khởi tạo lựa chọn ban đầu (chọn Variant đầu tiên)
  useEffect(() => {
    if (product && product.variants.length > 0 && !selectedColorId) {
      const firstVariant = product.variants[0];
      setSelectedColorId(firstVariant.color._id);
      setSelectedSizeId(firstVariant.size._id);
    }
  }, [product, selectedColorId]);

  // 3. Tính toán các Options duy nhất (Màu, Size)
  const options = useMemo(() => {
    if (!product) return { colors: [], sizes: [] };

    const uniqueColors = new Map<string, Color>();
    const uniqueSizes = new Map<string, Size>();

    product.variants.forEach((v) => {
      uniqueColors.set(v.color._id, v.color);
      uniqueSizes.set(v.size._id, v.size);
    });

    return {
      colors: Array.from(uniqueColors.values()),
      sizes: Array.from(uniqueSizes.values()),
    };
  }, [product]);

  // 4. Tìm Variant đang được chọn (Matching Variant)
  const currentVariant = useMemo(() => {
    if (!product || !selectedColorId || !selectedSizeId) return null;

    return (
      product.variants.find(
        (v) => v.color._id === selectedColorId && v.size._id === selectedSizeId
      ) || null
    ); // Trả về null nếu không tìm thấy kết hợp
  }, [product, selectedColorId, selectedSizeId]);

  // 5. Logic Kiểm tra tính khả dụng của một Size khi đã chọn Màu
  const isSizeAvailable = useCallback(
    (sizeId: string) => {
      if (!product || !selectedColorId) return true; // Nếu chưa chọn màu, size nào cũng khả dụng (tạm)

      // Kiểm tra xem có bất kỳ Variant nào chứa (Màu đang chọn + Size này) không
      return product.variants.some(
        (v) => v.color._id === selectedColorId && v.size._id === sizeId
      );
    },
    [product, selectedColorId]
  );

  // 6. Logic Kiểm tra tính khả dụng của một Màu khi đã chọn Size (Thường ít dùng, nhưng nên có)
  const isColorAvailable = useCallback(
    (colorId: string) => {
      if (!product || !selectedSizeId) return true;

      return product.variants.some(
        (v) => v.color._id === colorId && v.size._id === selectedSizeId
      );
    },
    [product, selectedSizeId]
  );

  // 7. Giá, Tồn kho và Trạng thái
  const displayPrice = currentVariant?.price ?? product?.base_price ?? 0;
  const currentStock = currentVariant?.stock_quantity ?? 0;
  const isOutOfStock = currentStock === 0;

  // 8. Handlers
  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= currentStock) {
      setQuantity(newQuantity);
    }
  };

  return {
    // Data Fetching
    product,
    loading,
    error,

    // Selection & Availability
    options,
    selectedColorId,
    selectedSizeId,
    quantity,
    currentVariant,

    // Calculated State
    displayPrice,
    currentStock,
    isOutOfStock,

    // Actions
    setSelectedColorId,
    setSelectedSizeId,
    handleQuantityChange,
    isSizeAvailable,
    isColorAvailable, // Thêm hàm kiểm tra khả dụng để disable nút
  };
};
