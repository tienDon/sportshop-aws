import { Request, Response } from "express";
import { CartService } from "../services/CartService.js";

export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const cart = await CartService.getCart({ userId });
    res.json({ success: true, data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { variantId, quantity } = req.body;

    if (!variantId || !quantity) {
      res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
      return;
    }

    const cart = await CartService.addToCart({
      identity: { userId },
      variantId,
      quantity,
    });
    res.json({ success: true, data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { itemId } = req.params; // cartItemId
    const { quantity } = req.body;

    if (!itemId || quantity === undefined) {
      res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
      return;
    }

    const cart = await CartService.updateCartItem(
      { userId },
      parseInt(itemId),
      quantity
    );
    res.json({ success: true, data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { itemId } = req.params;

    if (!itemId) {
      res.status(400).json({ success: false, message: "Missing id" });
      return;
    }

    const cart = await CartService.removeCartItem({ userId }, parseInt(itemId));
    res.json({ success: true, data: cart, message: "Item removed" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCartCount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const count = await CartService.getCartItemCount({ userId });
    res.json({ success: true, data: { count } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
