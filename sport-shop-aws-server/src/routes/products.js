import express from "express";
import ProductController from "../controllers/ProductController.js";

const router = express.Router();

// Public routes
router.get("/", ProductController.getAllProducts);

export default router;
