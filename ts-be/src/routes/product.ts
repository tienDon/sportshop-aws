import {
  createProduct,
  getProducts,
  createProductAudience,
  createProductCategory,
  createProductSport,
  createProductVariant,
  createProductAttributeValue,
  getProductVarients,
  deleteProductVariant,
  updateProductVariant,
  getProductsAudience,
  getProductCategories,
  getProductBySlug,
  // New Admin APIs
  getProductById,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
  deleteProductCategory,
  deleteProductAudience,
  deleteProductSport,
  deleteProductAttributeValue,
} from "@/controllers/ProductController.js";
import { Router } from "express";

const router = Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/slug/:slug", getProductBySlug);

router.post("/:id/audiences", createProductAudience);
router.get("/:id/audiences", getProductsAudience);

router.post("/:id/categories", createProductCategory);
router.get("/:id/categories", getProductCategories);

//productSports
router.post("/:id/sports", createProductSport);
//ProductVariant
router.post("/:id/variants", createProductVariant);

router.delete("/:id/variants/:variantId", deleteProductVariant);

//ProductAttributeValue
router.post("/:id/attribute-values", createProductAttributeValue);

router.get("/:id/variants", getProductVarients);
router.patch("/:id/variants/:variantId", updateProductVariant);

// ============ NEW ADMIN ROUTES ============
router.get("/admin/all", getAllProductsAdmin);
router.get("/:id", getProductById);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

// Product Relations Management
router.delete("/:id/categories/:categoryId", deleteProductCategory);
router.delete("/:id/audiences/:audienceId", deleteProductAudience);
router.delete("/:id/sports/:sportId", deleteProductSport);
router.delete(
  "/:id/attribute-values/:attributeValueId",
  deleteProductAttributeValue
);

export default router;
