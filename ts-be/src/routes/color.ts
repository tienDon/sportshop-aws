import {
  createColor,
  getAllColors,
  getColorById,
  removeColor,
  updateColor,
} from "@/controllers/ColorController.js";
import { Router } from "express";

const router = Router();

router.get("/", getAllColors);
router.post("/", createColor);
router.get("/:id", getColorById);
router.put("/:id", updateColor);
router.delete("/:id", removeColor);

export default router;
