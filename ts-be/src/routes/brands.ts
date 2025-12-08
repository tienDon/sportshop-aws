import { Router } from "express";
import * as BrandController from "../controllers/BrandController.js";

const router = Router();

router.get("/", BrandController.getAllBrands);
// router.get("/all", BrandController.getBrands); // alias
// router.get("/:id", BrandController.getBrand);
router.post("/", BrandController.createBrand);
router.put("/:id", BrandController.updateBrand);
router.delete("/:id", BrandController.deleteBrand);

export default router;
