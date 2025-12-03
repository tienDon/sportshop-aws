import express from "express";
import CategoryController from "../controllers/CategoryController.js";

const router = express.Router();

// Public routes
router.get("/navigation", CategoryController.getNavigationCategories);
// router.get("/tree", CategoryController.getCategoryTree);
// router.get("/", CategoryController.getAllCategories);
// router.get("/slug/:slug", CategoryController.getCategoryBySlug);
// router.get("/:id", CategoryController.getCategoryById);

// // Admin routes (sẽ thêm middleware auth admin sau)
// router.post("/", CategoryController.createCategory);
// router.put("/:id", CategoryController.updateCategory);
// router.delete("/:id", CategoryController.deleteCategory);

export default router;
