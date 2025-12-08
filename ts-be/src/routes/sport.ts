import {
  createSport,
  getAllSports,
  removeSport,
  updateSport,
} from "@/controllers/SportController.js";
import { Router } from "express";

const router = Router();

router.get("/", getAllSports);
router.post("/", createSport);
router.delete("/:id", removeSport);
router.put("/:id", updateSport);

export default router;
