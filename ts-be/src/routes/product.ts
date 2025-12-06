import { createProduct } from "@/controllers/ProductController.js";
import { Router } from "express";

const router = Router();

router.post("/", createProduct);

export default router;
