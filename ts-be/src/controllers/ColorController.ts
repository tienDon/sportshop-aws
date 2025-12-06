import { ColorService } from "@/services/ColorService.js";
import { Request, Response } from "express";

export const getAllColors = async (req: Request, res: Response) => {
  try {
    const colors = await ColorService.getAllColors();
    return res.status(200).json({
      success: true,
      message: "Fetched all colors successfully",
      data: colors,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch colors",
      error: error.message,
    });
  }
};
export const createColor = async (req: Request, res: Response) => {
  try {
    const { name, hexCode } = req.body;
    if (!name || !hexCode) {
      return res.status(400).json({
        success: false,
        message: "Name and hexCode are required",
      });
    }
    const color = await ColorService.createColor(name, hexCode);
    return res.status(201).json({
      success: true,
      message: "Color created successfully",
      data: color,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create color",
      error: (error as Error).message,
    });
  }
};
export const getColorById = async (req: Request, res: Response) => {};
