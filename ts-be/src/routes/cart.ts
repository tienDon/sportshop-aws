import {
  addToCart,
  getCart,
  removeCartItem,
  updateCartItem,
  getCartCount,
} from "@/controllers/CartController.js";
import { authenticateToken } from "@/middlewares/auth.js";
import { Router } from "express";

const router = Router();

router.get("/", authenticateToken, getCart);
router.post("/items", authenticateToken, addToCart);
// {
//     "variantId": 5,
//     "quantity": 1
// }

router.patch("/items/:itemId", authenticateToken, updateCartItem);
// {
//     "itemId": 1,
//     "quantity": 1
// }

router.delete("/items/:itemId", authenticateToken, removeCartItem);

router.get("/items/count", authenticateToken, getCartCount);
// {
//     "success": true,
//     "data": {
//         "count": 1
//     }
// }

export default router;
