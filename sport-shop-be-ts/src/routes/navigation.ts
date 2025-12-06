import { Router } from "express";
import * as NavigationController from "../controllers/NavigationController";

const router = Router();

router.get("/", NavigationController.getNavigation);

export default router;
