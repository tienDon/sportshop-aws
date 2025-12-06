import { Router } from "express";
import productRoutes from "./products.js";
import brandRoutes from "./brands.js";
import categoryRoutes from "./categories.js";
import authRoutes from "./auth.js";
import sportRoutes from "./sport.js";
import colorRoutes from "./color.js";
import sizeRoutes from "./size.js";
import attributeRoutes from "./attribute.js";

const router = Router();

// router.use("/products", productRoutes);
router.use("/brands", brandRoutes);
// router.use("/categories", categoryRoutes);
router.use("/auth", authRoutes);
router.use("/sports", sportRoutes);
router.use("/colors", colorRoutes);
router.use("/sizes", sizeRoutes);
router.use("/attributes", attributeRoutes);

export default router;
