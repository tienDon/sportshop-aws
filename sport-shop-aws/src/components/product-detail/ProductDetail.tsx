import React from "react";
import type { useProductDetail } from "@/hooks/useProductDetail";
import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";

type ProductDetailProps = ReturnType<typeof useProductDetail>;

const ProductDetail = (props: ProductDetailProps) => {
  const { product } = props;

  if (!product) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-8">
      <ProductGallery images={product.images} productName={product.name} />
      <ProductInfo {...props} />
    </div>
  );
};

export default ProductDetail;
