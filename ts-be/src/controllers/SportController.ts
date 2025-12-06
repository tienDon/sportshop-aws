import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { ApiResponse } from "../types/index.js";
import { SportService } from "@/services/SportService.js";

export const getAllSports = async (req: Request, res: Response) => {
  try {
    // const { role } = req?.body;
    console.log("run");
    const sports = await SportService.getAllSports();
    return res.status(200).json({
      success: true,
      message: "Fetched all sports successfully",
      data: sports,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error creating brand",
      error: error.message,
    });
  }
};

export const createSport = async (req: Request, res: Response) => {
  try {
    const { name, slug } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên thể thao là bắt buộc",
      });
    }
    const sport = await SportService.createSport(name, slug);
    return res.status(201).json({
      success: true,
      message: "Tạo thể thao thành công",
      data: { sport },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error creating brand",
      error: error.message,
    });
  }
};
