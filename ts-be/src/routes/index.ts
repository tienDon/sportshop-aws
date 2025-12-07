import { Router } from "express";
import productRoutes from "./product.js";
import brandRoutes from "./brands.js";
import categoryRoutes from "./category.js";
import authRoutes from "./auth.js";
import sportRoutes from "./sport.js";
import colorRoutes from "./color.js";
import sizeRoutes from "./size.js";
import attributeRoutes from "./attribute.js";
import audienceRoutes from "./audience.js";
import navigationRoutes from "./navigation.js";

const router = Router();

router.use("/products", productRoutes);
router.use("/brands", brandRoutes);
router.use("/auth", authRoutes);
router.use("/sports", sportRoutes);
router.use("/colors", colorRoutes);
router.use("/sizes", sizeRoutes);
router.use("/attributes", attributeRoutes);
router.use("/audiences", audienceRoutes);
router.use("/categories", categoryRoutes);
router.use("/navigation", navigationRoutes);

export default router;
