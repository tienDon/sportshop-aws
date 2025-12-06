import { Router } from "express";
import * as CategoryController from "../controllers/CategoryController";

const router = Router();

router.get("/", CategoryController.getAllCategories);
router.get("/:slug", CategoryController.getCategoryBySlug);

export default router;
