import {
  createCategory,
  getCategoryById,
  getCategoryTree,
  deleteAllCategories,
  createCategoryAudiences,
  createCategoryAttributes,
  getCategoryByAudienceSlug,
  getCategoryAttributes,
} from "@/controllers/CategoryController.js";
import { Router } from "express";

const router = Router();

router.get("/tree", getCategoryTree);
router.post("/", createCategory);
router.get("/:id", getCategoryById);
router.delete("/", deleteAllCategories); // For testing purposes only

router.post("/:categoryId/audiences", createCategoryAudiences);
router.get("/audiences/:slug", getCategoryByAudienceSlug);

router.post("/:categoryId/attributes", createCategoryAttributes);
router.get("/:categoryId/attributes", getCategoryAttributes);

export default router;
