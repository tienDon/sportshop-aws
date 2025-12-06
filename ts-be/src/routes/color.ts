import {
  createColor,
  getAllColors,
  getColorById,
} from "@/controllers/ColorController.js";
import { Router } from "express";

const router = Router();

router.get("/", getAllColors);
router.post("/", createColor);
router.get("/:id", getColorById);

export default router;
