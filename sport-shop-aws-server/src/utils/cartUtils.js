export const findVariant = (product, variantId) => {
  if (!product || !product.variants) return null;
  return product.variants.find(
    (v) =>
      (v.variant_id ? v.variant_id.toString() : v._id.toString()) ===
      variantId.toString()
  );
};

export const getVariantId = (variant) => {
  return variant.variant_id
    ? variant.variant_id.toString()
    : variant._id.toString();
};
