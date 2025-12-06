import { Router } from "express";
import * as ProductController from "../controllers/ProductController";

const router = Router();

router.get("/", ProductController.getAllProducts);
router.get("/:slug", ProductController.getProductBySlug);
router.get("/id/:id", ProductController.getProductById);

export default router;
