import express from "express";
import ProductController from "../controllers/ProductController.js";

const router = express.Router();

// Public routes
router.get("/", ProductController.getAllProducts);
router.get("/slug/:slug", ProductController.getProductBySlug);

export default router;
