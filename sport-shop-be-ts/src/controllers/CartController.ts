import { Request, Response } from "express";

export const getCart = async (req: Request, res: Response) => {
  res.json({ message: "Get cart" });
};

export const addToCart = async (req: Request, res: Response) => {
  res.json({ message: "Add to cart" });
};

export const updateCartItem = async (req: Request, res: Response) => {
  res.json({ message: "Update cart item" });
};

export const removeFromCart = async (req: Request, res: Response) => {
  res.json({ message: "Remove from cart" });
};
