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

export const createProductAudience = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const { audienceId } = req.body;
    if (!audienceId) {
      return res.status(400).json({
        success: false,
        message: "audienceId is required in the request body",
      });
    }
    const product = await ProductService.addAudienceToProduct(
      Number(productId),
      Number(audienceId)
    );
    res.status(200).json({
      success: true,
      message: "Audience added to product successfully",
      data: product,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error creating product audience",
      error: error.message,
    });
  }
};
export const createProductCategory = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const { categoryId, isPrimary } = req.body;
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "categoryId is required in the request body",
      });
    }
    const prodcuct = await ProductService.addCategoryToProduct(
      Number(productId),
      Number(categoryId),
      Boolean(isPrimary)
    );
    res.status(200).json({
      success: true,
      message: "Category added to product successfully",
      data: prodcuct,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating product category",
      error: (error as Error).message,
    });
  }
};

export const createProductSport = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const { sportId } = req.body;
    if (!sportId) {
      return res.status(400).json({
        success: false,
        message: "sportId is required in the request body",
      });
    }
    const product = await ProductService.addSportToProduct(
      Number(productId),
      Number(sportId)
    );
    res.status(200).json({
      success: true,
      message: "Sport added to product successfully",
      data: product,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error creating product sport",
      error: error.message,
    });
  }
};

export const createProductVariant = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const { colorId, sizeId, price, stockQuantity, sku } = req.body;
    if (
      !colorId ||
      !sizeId ||
      price === undefined ||
      stockQuantity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "colorId, sizeId, price, and stockQuantity are required in the request body",
      });
    }
    const variant = await ProductService.addVariantToProduct(
      Number(productId),
      Number(colorId),
      Number(sizeId),
      Number(price),
      Number(stockQuantity),
      sku
    );
    res.status(200).json({
      success: true,
      message: "Variant added to product successfully",
      data: variant,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error creating product variant",
      error: error.message,
    });
  }
};

export const deleteProductVariant = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const variantId = req.params.variantId;
    if (!variantId) {
      return res.status(400).json({
        success: false,
        message: "variantId is required in the request body",
      });
    }
    const variant = await ProductService.deleteVariantFromProduct(
      Number(productId),
      Number(variantId)
    );
    return res.status(200).json({
      success: true,
      message: "Variant deleted from product successfully",
      data: variant,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error deleting product variant",
      error: error.message,
    });
  }
};

export const createProductAttributeValue = async (
  req: Request,
  res: Response
) => {
  try {
    const productId = req.params.id;
    const { attributeValueId } = req.body;
    if (!attributeValueId) {
      return res.status(400).json({
        success: false,
        message: "attributeValueId is required in the request body",
      });
    }
    const product = await ProductService.addAttributeValueToProduct(
      Number(productId),
      Number(attributeValueId)
    );
    res.status(200).json({
      success: true,
      message: "Attribute value added to product successfully",
      data: product,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error creating product attribute value",
      error: error.message,
    });
  }
};

export const getProductVarients = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const variants = await ProductService.getVariantsByProductId(
      Number(productId)
    );
    res.status(200).json({
      success: true,
      data: variants,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error getting product variants",
      error: error.message,
    });
  }
};
export const updateProductVariant = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const variantId = req.params.variantId;
    const { colorId, sizeId, price, stockQuantity, sku, imageUrls } = req.body;

    const updatedVariant = await ProductService.updateVariantOfProduct(
      Number(productId),
      Number(variantId),
      colorId ? Number(colorId) : undefined,
      sizeId ? Number(sizeId) : undefined,
      price !== undefined ? Number(price) : undefined,
      stockQuantity !== undefined ? Number(stockQuantity) : undefined,
      sku,
      imageUrls
    );
    res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      data: updatedVariant,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error updating product variant",
      error: error.message,
    });
  }
};

export const getProductsAudience = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const audiences = await ProductService.getAudiencesByProductId(
      Number(productId)
    );
    return res.status(200).json({
      success: true,
      data: audiences,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching product audiences",
      error: error.message,
    });
  }
};

export const getProductCategories = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const categories = await ProductService.getCategoriesByProductId(
      Number(productId)
    );
    return res.status(200).json({
      success: true,
      message: "Product categories fetched successfully",
      data: categories,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching product categories",
      error: error.message,
    });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const product = await ProductService.getProductBySlug(slug);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

// ============ NEW ADMIN APIs ============

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await ProductService.getProductByIdAdmin(Number(id));
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const product = await ProductService.updateProduct(Number(id), updateData);
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await ProductService.deleteProduct(Number(id));
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

export const getAllProductsAdmin = async (req: Request, res: Response) => {
  try {
    const products = await ProductService.getAllProductsAdmin();
    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};
