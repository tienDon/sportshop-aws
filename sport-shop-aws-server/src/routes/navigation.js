import express from "express";
import { getMainNavigation } from "../controllers/NavigationController.js";

const router = express.Router();

// GET /api/navigation/main - Lấy dữ liệu cho main navigation/navbar
router.get("/main", getMainNavigation);

export default router;
