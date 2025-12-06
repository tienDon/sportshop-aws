import {
  createSize,
  deleteAllSizes,
  getAllSizes,
  getSizeByChartSize,
} from "@/controllers/SizeControler.js";
import { prisma } from "@/lib/prisma.js";
import { Router } from "express";

const router = Router();

router.get("/", getAllSizes);
router.get("/:chartType", getSizeByChartSize);
router.post("/", createSize);
router.delete("/", deleteAllSizes);

export default router;
