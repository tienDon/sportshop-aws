import { SizeService } from "@/services/SizeService.js";
import { Request, Response } from "express";
import { SizeChartType } from "../../generated/prisma/enums.js";

export const getAllSizes = async (req: Request, res: Response) => {
  try {
    let { chartType, page, limit } = req.query;
    const pageNum = page ? parseInt(page as string) : undefined;
    const limitNum = limit ? parseInt(limit as string) : undefined;

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
      const result = await SizeService.getSizeByChartType(
        chartType as SizeChartType,
        pageNum,
        limitNum
      );

      // Check if result is paginated or array
      if (pageNum && limitNum) {
        return res.status(200).json({
          success: true,
          message: "Fetched sizes by chart type successfully",
          data: result, // { sizes, total, totalPages, currentPage }
        });
      }

      return res.status(200).json({
        success: true,
        message: "Fetched sizes by chart type successfully",
        data: result,
      });
    }

    const result = await SizeService.getAllSizes(pageNum, limitNum);

    if (pageNum && limitNum) {
      return res.status(200).json({
        success: true,
        message: "Fetched all sizes successfully",
        data: result,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched all sizes successfully",
      data: result,
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

const isSizeChartType = (value: any): value is SizeChartType => {
  return Object.values(SizeChartType).includes(value);
};

export const deleteSize = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Size id is required",
      });
    }
    const size = await SizeService.deleteSize(Number(id));
    return res.status(200).json({
      success: true,
      message: "Size deleted successfully",
      data: size,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error deleting size",
      error: error.message,
    });
  }
};

export const updateSize = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Size id is required",
      });
    }
    const { name, chartType, sortOrder } = req.body;
    const size = await SizeService.updateSize(Number(id), {
      name,
      chartType,
      sortOrder,
    });
    return res.status(200).json({
      success: true,
      message: "Size updated successfully",
      data: size,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating size",
      error: (error as Error).message,
    });
  }
};

export const getChartSize = async (req: Request, res: Response) => {
  return res.status(200).json({
    superss: true,
    message: "Fetched chart types successfully",
    data: Object.values(SizeChartType),
  });
};
