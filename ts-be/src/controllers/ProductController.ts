import { Request, Response } from "express";
import ProductService from "../services/ProductService.js";
import { prisma } from "../lib/prisma.js";

/**
 * Get all products
 * GET /api/products
 */
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const result = await ProductService.getAllProducts(req.query);
    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Lỗi truy vấn sản phẩm:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi Server nội bộ.",
      error: error.message,
    });
  }
};

/**
 * Get products - alias for getAllProducts
 */
export const getProducts = async (req: Request, res: Response) => {
  return getAllProducts(req, res);
};

/**
 * Get product by slug
 * GET /api/products/slug/:slug
 */
export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const product = await ProductService.getProductBySlug(slug);
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error("Lỗi lấy chi tiết sản phẩm:", error);
    if (error.message === "PRODUCT_NOT_FOUND") {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm.",
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: "Lỗi Server nội bộ.",
      error: error.message,
    });
  }
};

/**
 * Get product by ID
 * GET /api/products/:id
 */
export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: {
        id: Number(id),
        isActive: true,
      },
      include: {
        brand: true,
        categories: {
          include: {
            category: true,
          },
        },
        images: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          where: { isActive: true },
          include: {
            attributes: {
              include: {
                attribute: true,
                attributeValue: true,
              },
            },
          },
        },
        badges: {
          where: { isActive: true },
        },
      },
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy thông tin sản phẩm",
      error: error.message,
    });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: "Create product not implemented yet",
  });
};

export const updateProduct = async (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: "Update product not implemented yet",
  });
};

export const deleteProduct = async (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    message: "Delete product not implemented yet",
  });
};
