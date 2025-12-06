import { SizeService } from "@/services/SizeService.js";
import { Request, Response } from "express";
import { SizeChartType } from "../../generated/prisma/enums.js";

export const getAllSizes = async (req: Request, res: Response) => {
  try {
    let { chartType } = req.query;
    if (chartType) {
      chartType = chartType?.toString().replace(/[-\s]/g, "_").toUpperCase();
      console.log(chartType);
      if (!isSizeChartType(chartType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid chartSize. Allowed: ${Object.values(
            SizeChartType
          ).join(", ")}`,
        });
      }
      const sizes = await SizeService.getSizeByChartType(
        chartType as SizeChartType
      );
      return res.status(200).json({
        success: true,
        message: "Fetched sizes by chart type successfully",
        data: sizes,
      });
    }
    const sizes = await SizeService.getAllSizes();
    return res.status(200).json({
      success: true,
      message: "Fetched all sizes successfully",
      data: sizes,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching sizes",
      error: error.message,
    });
  }
};

export const getSizeByChartSize = async (req: Request, res: Response) => {
  try {
    const { chartType } = req.params;
    if (!chartType) {
      return res.status(400).json({
        success: false,
        message: "chartType parameter is required ",
      });
    }
    const formattedChartType = chartType
      .toString()
      .replace(/[-\s]/g, "_")
      .toUpperCase();

    if (!isSizeChartType(formattedChartType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chartType parameter",
      });
    }

    const sizes = await SizeService.getSizeByChartType(
      formattedChartType as SizeChartType
    );

    return res.status(200).json({
      success: true,
      message: "Fetched size by chart size successfully",
      data: sizes,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching size by chart size",
      error: error.message,
    });
  }
};

export const createSize = async (req: Request, res: Response) => {
  try {
    const { name, chartType, sortOrder } = req.body;
    if (!name || !chartType) {
      return res.status(400).json({
        success: false,
        message: "Name and chartType are required",
      });
    }
    if (!isSizeChartType(chartType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chartType",
      });
    }

    const size = await SizeService.createSize({ name, chartType, sortOrder });
    return res.status(201).json({
      success: true,
      message: "Size created successfully",
      data: size,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error creating size",
      error: error.message,
    });
  }
};

export const deleteAllSizes = async (req: Request, res: Response) => {
  try {
    const deletedSizes = await SizeService.deleteAllSizes();
    return res.status(200).json({
      success: true,
      message: "All sizes deleted successfully",
      data: deletedSizes,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error deleting all sizes",
      error: error.message,
    });
  }
};

const isSizeChartType = (value: any): value is SizeChartType => {
  return Object.values(SizeChartType).includes(value);
};
