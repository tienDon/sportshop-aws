import {
  createSize,
  getAllSizes,
  getSizeByChartSize,
  deleteSize,
  updateSize,
  getChartSize,
} from "@/controllers/SizeControler.js";
import { prisma } from "@/lib/prisma.js";
import { Router } from "express";

const router = Router();

router.get("/", getAllSizes);
router.get("/:chartType", getSizeByChartSize);
router.post("/", createSize);

router.get("/chart/type", getChartSize);
router.delete("/:id", deleteSize);

router.put("/:id", updateSize);

export default router;
