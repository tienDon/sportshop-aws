import {
  createCategory,
  getCategoryById,
  getCategoryTree,
  deleteAllCategories,
  createCategoryAudiences,
  createCategoryAttributes,
  getCategoryByAudienceSlug,
  getCategoryAttributes,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryAudiences,
} from "@/controllers/CategoryController.js";
import { Router } from "express";

const router = Router();

router.get("/tree", getCategoryTree);
router.get("/all", getAllCategories);
router.post("/", createCategory);
router.get("/:id", getCategoryById);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
router.delete("/", deleteAllCategories); // For testing purposes only

router.get("/:categoryId/audiences", getCategoryAudiences);
router.post("/:categoryId/audiences", createCategoryAudiences);
router.get("/audiences/:slug", getCategoryByAudienceSlug);

router.get("/:categoryId/attributes", getCategoryAttributes);
router.post("/:categoryId/attributes", createCategoryAttributes);

export default router;
