import {
  createAudience,
  deleteAudience,
  getAllAudiences,
  getAudienceById,
  updateAudience,
} from "@/controllers/AudienceController.js";
import { Router } from "express";

const router = Router();

router.get("/", getAllAudiences);
router.get("/:id", getAudienceById);
router.post("/", createAudience);
router.put("/:id", updateAudience);
router.delete("/:id", deleteAudience);

export default router;
