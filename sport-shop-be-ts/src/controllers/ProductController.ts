import { Request, Response } from "express";

export const getAllProducts = async (req: Request, res: Response) => {
  res.json({ message: "Get all products" });
};

export const getProductBySlug = async (req: Request, res: Response) => {
  res.json({ message: "Get product by slug" });
};

export const getProductById = async (req: Request, res: Response) => {
  res.json({ message: "Get product by id" });
};
