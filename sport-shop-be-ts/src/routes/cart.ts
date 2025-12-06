import { Router } from "express";
import * as CartController from "../controllers/CartController";

const router = Router();

router.get("/", CartController.getCart);
router.post("/", CartController.addToCart);
router.put("/:itemId", CartController.updateCartItem);
router.delete("/:itemId", CartController.removeFromCart);

export default router;
