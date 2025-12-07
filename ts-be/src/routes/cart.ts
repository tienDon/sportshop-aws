import {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "@/controllers/CartController.js";
import { Router } from "express";

const router = Router();

router.get("/", getCart);
router.post("/items", addToCart);
router.patch("/items/:itemId", updateCartItem);
router.delete("/items/:itemId", removeCartItem);

export default router;
