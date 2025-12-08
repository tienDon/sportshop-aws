import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { ApiResponse } from "../types/index.js";
import { BrandService } from "../services/BrandService.js";

export const getAllBrands = async (req: Request, res: Response) => {
  try {
    // Lấy tất cả brand đang active, sắp xếp theo tên A-Z
    const brands = await BrandService.getAllBrands();

    const response: ApiResponse = {
      success: true,
      message: "Lấy danh sách thương hiệu thành công",
      data: {
        brands: brands,
        count: brands.length,
      },
    };

    res.status(200).json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách thương hiệu",
      error: error.message,
    });
  }
};

export const getBrands = async (req: Request, res: Response) => {
  // Alias for getAllBrands to maintain compatibility
  return getAllBrands(req, res);
};

export const getBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findUnique({
      where: {
        id: Number(id),
        isActive: true,
      },
      include: {
        products: {
          where: { isActive: true },
          take: 10,
        },
      },
    });

    if (!brand) {
      res.status(404).json({
        success: false,
        message: "Brand not found",
      });
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: "Brand retrieved successfully",
      data: brand,
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Error retrieving brand",
      error: error.message,
    });
  }
};

export const createBrand = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, logo, banner, isActive } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        message: "Brand name is required",
      });
      return;
    }

    const newBrand = await BrandService.createBrand({
      name,
      description,
      logo,
      banner,
      isActive,
      slug,
    });

    const response: ApiResponse = {
      success: true,
      message: "Brand created successfully",
      data: newBrand,
    };

    res.status(201).json(response);
  } catch (error: any) {
    // console.error("Create brand error:", error);

    if (error.message === "Brand with this name/slug already exists") {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error creating brand",
      error: error.message,
    });
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, logo, banner, isActive } = req.body;
    const updatedBrand = await BrandService.updateBrand(Number(id), {
      name,
      slug,
      description,
      logo,
      banner,
      isActive,
    });
    return res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      data: updatedBrand,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating brand",
      error: (error as Error).message,
    });
  }
};

export const deleteBrand = async (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: "Delete brand not implemented yet",
  });
};
