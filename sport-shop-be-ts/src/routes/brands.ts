import { Router } from "express";
import * as BrandController from "../controllers/BrandController";

const router = Router();

router.get("/", BrandController.getAllBrands);
router.get("/:slug", BrandController.getBrandBySlug);

export default router;
