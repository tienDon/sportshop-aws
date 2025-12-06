import { AudienceService } from "@/services/AudienceService.js";
import { Request, Response } from "express";

export const getAllAudiences = async (req: Request, res: Response) => {
  try {
    const audiences = await AudienceService.getAllAudiences();
    return res.status(200).json({
      success: true,
      message: "Audiences retrieved successfully",
      data: audiences,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving audiences",
      error: (error as Error).message,
    });
  }
};
export const getAudienceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const audience = await AudienceService.getAudienceById(Number(id));
    return res.status(200).json({
      success: true,
      message: "Audience retrieved successfully",
      data: audience,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving audience",
      error: (error as Error).message,
    });
  }
};
export const createAudience = async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    const newAudience = await AudienceService.createAudience(name, slug);
    return res.status(201).json({
      success: true,
      message: "Audience created successfully",
      data: newAudience,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating audience",
      data: (error as Error).message,
    });
  }
};
export const updateAudience = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;
    const updatedAudience = await AudienceService.updateAudience(
      Number(id),
      name,
      slug
    );
    return res.status(200).json({
      success: true,
      message: "Audience updated successfully",
      data: updatedAudience,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating audience",
      data: (error as Error).message,
    });
  }
};
export const deleteAudience = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedAudience = await AudienceService.deleteAudience(Number(id));
    return res.status(200).json({
      success: true,
      message: "Audience deleted successfully",
      data: deletedAudience,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting audience",
      data: (error as Error).message,
    });
  }
};
