import express from "express";
import BrandController from "../controllers/BrandController.js";

const router = express.Router();

// Public routes
router.get("/", BrandController.getAllBrands);

export default router;
