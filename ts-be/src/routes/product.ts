import { createProduct, getProducts } from "@/controllers/ProductController.js";
import { Router } from "express";

const router = Router();

router.post("/", createProduct);
router.get("/", getProducts);

export default router;
