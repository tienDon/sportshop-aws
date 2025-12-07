import { NavigationService } from "@/services/NavigationService.js";
import { Request, Response } from "express";

export const getMainNavigation = async (req: Request, res: Response) => {
  try {
    const navigationData = await NavigationService.getMainNavigation();
    res.status(200).json({
      success: true,
      data: navigationData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching navigation data",
      error: (error as Error).message,
    });
  }
};
