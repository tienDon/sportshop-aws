import { getMainNavigation } from "@/controllers/navigationController.js";
import { Router } from "express";

const router = Router();

router.get("/main", getMainNavigation);
export default router;
