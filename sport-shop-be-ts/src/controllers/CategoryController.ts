import { Request, Response } from "express";

export const getAllCategories = async (req: Request, res: Response) => {
  res.json({ message: "Get all categories" });
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  res.json({ message: "Get category by slug" });
};
