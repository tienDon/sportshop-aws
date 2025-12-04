import express from "express";
import CartController from "../controllers/CartController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// Apply middleware to all cart routes (Require Login)
router.use(authenticateToken);

router.get("/", CartController.getCart);
router.get("/count", CartController.getCartCount);
router.post("/add", CartController.addToCart);
router.put("/update", CartController.updateCartItem);
router.delete("/item/:variant_id", CartController.removeCartItem);

export default router;
