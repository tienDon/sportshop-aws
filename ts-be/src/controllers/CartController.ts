import { Request, Response } from "express";

export const getCart = (req: Request, res: Response) => {
  // Logic to get cart details
  res.json({ message: "Get cart details" });
};

export const addToCart = (req: Request, res: Response) => {};
export const updateCartItem = (req: Request, res: Response) => {};
export const removeCartItem = (req: Request, res: Response) => {};
