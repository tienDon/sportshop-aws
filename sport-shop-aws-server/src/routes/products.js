import express from "express";
import ProductController from "../controllers/ProductController.js";

const router = express.Router();

// Public routes
router.get("/", ProductController.getAllProducts);
router.get("/search", ProductController.searchProducts);
router.get("/featured", ProductController.getFeaturedProducts);
router.get("/new-arrivals", ProductController.getNewArrivals);
router.get("/best-sellers", ProductController.getBestSellers);
router.get("/category/:categorySlug", ProductController.getProductsByCategory);
router.get("/brand/:brandSlug", ProductController.getProductsByBrand);
router.get("/slug/:slug", ProductController.getProductBySlug);

// Admin routes (sẽ thêm middleware auth admin sau)
router.post("/", ProductController.createProduct);
router.put("/:id", ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);

export default router;
