import { Request, Response } from "express";

export const getNavigation = async (req: Request, res: Response) => {
  res.json({ message: "Get navigation structure" });
};
