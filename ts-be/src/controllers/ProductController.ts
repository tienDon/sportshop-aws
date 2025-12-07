import { Request, Response } from "express";
import ProductService from "../services/ProductService.js";
import { prisma } from "../lib/prisma.js";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const productData = req.body;
    const newProduct = await ProductService.createProduct(productData);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      slugCategory,
      slugAudience,
      slugBrand,
      slugSport,
      q,
      colorSlugs,
      minPrice,
      maxPrice,
      limit,
      page,
    } = req.query;

    let filters: any = {};

    if (slugCategory) filters.category_slug = slugCategory;
    if (slugAudience) filters.gender_slug = slugAudience;
    if (slugBrand) filters.brand_slug = slugBrand;
    if (slugSport) filters.sport_slug = slugSport;
    if (q) filters.q = q;
    if (colorSlugs) filters.color_slugs = colorSlugs;
    if (minPrice) filters.min_price = Number(minPrice);
    if (maxPrice) filters.max_price = Number(maxPrice);

    const pagination: any = {};
    if (limit) pagination.limit = Number(limit);
    if (page) pagination.page = Number(page);

    const result = await ProductService.getProductsByQuery(filters, pagination);
    res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};
