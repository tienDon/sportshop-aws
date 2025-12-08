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

export const updateColor = async (req: Request, res: Response) => {
  try {
    const colorId = req.params.id;
    const { name, hexCode } = req.body;
    const updatedColor = await ColorService.updateColor(colorId, name, hexCode);
    return res.status(200).json({
      success: true,
      message: "Color updated successfully",
      data: updatedColor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update color",
      error: (error as Error).message,
    });
  }
};

export const removeColor = async (req: Request, res: Response) => {
  try {
    const colorId = req.params.id;
    const deletedColor = await ColorService.deleteColor(colorId);
    return res.status(200).json({
      success: true,
      message: "Color deleted successfully",
      data: deletedColor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete color",
      error: (error as Error).message,
    });
  }
};
