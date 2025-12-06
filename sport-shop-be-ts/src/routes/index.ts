import { Router } from "express";
import authRoutes from "./auth";
import categoryRoutes from "./categories";
import brandRoutes from "./brands";
import productRoutes from "./products";
import navigationRoutes from "./navigation";
import cartRoutes from "./cart";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Welcome to Sport Shop API" });
});

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/products", productRoutes);
router.use("/navigation", navigationRoutes);
router.use("/cart", cartRoutes);

export default router;
