import { Request, Response } from "express";

export const getAllBrands = async (req: Request, res: Response) => {
  res.json({ message: "Get all brands" });
};

export const getBrandBySlug = async (req: Request, res: Response) => {
  res.json({ message: "Get brand by slug" });
};
