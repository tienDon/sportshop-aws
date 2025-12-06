import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { ApiResponse } from "../types/index.js";

/**
 * Get all main categories for navigation
 * GET /api/categories/navigation
 */
export const getNavigationCategories = async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        level: 0,
        isActive: true,
        isNavigation: true,
      },
      include: {
        children: {
          where: { isActive: true, isNavigation: true },
          orderBy: { sortOrder: "asc" },
          include: {
            children: {
              where: { isActive: true, isNavigation: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh mục navigation",
      error: error.message,
    });
  }
};

/**
 * Get all categories
 * GET /api/categories
 */
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const { level, parent, featured, active = "true" } = req.query;

    const where: any = {};

    if (active !== undefined) {
      where.isActive = active === "true";
    }

    if (level !== undefined) {
      where.level = parseInt(level as string);
    }

    if (parent) {
      where.parentId = Number(parent);
    }

    if (featured !== undefined) {
      where.isFeatured = featured === "true";
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
    });

    res.status(200).json({
      success: true,
      data: {
        categories: categories,
        count: categories.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy danh sách danh mục",
      error: error.message,
    });
  }
};

/**
 * Get categories - alias for getAllCategories
 */
export const getCategories = async (req: Request, res: Response) => {
  return getAllCategories(req, res);
};

/**
 * Get category by slug
 * GET /api/categories/slug/:slug
 */
export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy thông tin danh mục",
      error: error.message,
    });
  }
};

/**
 * Get category by ID
 * GET /api/categories/:id
 */
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: {
        id: Number(id),
        isActive: true,
      },
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!category) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy thông tin danh mục",
      error: error.message,
    });
  }
};

export const getCategory = async (req: Request, res: Response) => {
  return getCategoryById(req, res);
};

export const createCategory = async (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: "Create category not implemented yet",
  });
};

export const updateCategory = async (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: "Update category not implemented yet",
  });
};

export const deleteCategory = async (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: "Delete category not implemented yet",
  });
};
