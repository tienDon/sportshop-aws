import express from "express";
import BrandController from "../controllers/BrandController.js";

const router = express.Router();

// Public routes
router.get("/", BrandController.getAllBrands);
router.get("/featured", BrandController.getFeaturedBrands);
router.get("/slug/:slug", BrandController.getBrandBySlug);
router.get("/:id", BrandController.getBrandById);

// Admin routes (sẽ thêm middleware auth admin sau)
router.post("/", BrandController.createBrand);
router.put("/:id", BrandController.updateBrand);
router.delete("/:id", BrandController.deleteBrand);

export default router;
