import { createSport, getAllSports } from "@/controllers/SportController.js";
import { Router } from "express";

const router = Router();

router.get("/", getAllSports);
router.post("/", createSport);

export default router;
