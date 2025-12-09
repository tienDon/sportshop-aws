import { CategoryService } from "@/services/CategoryService.js";
import { Request, Response } from "express";

export const getCategoryTree = async (req: Request, res: Response) => {
  try {
    const categories = await CategoryService.getCategoryTree();
    return res.status(200).json({
      success: true,
      message: "Category tree fetched successfully",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, parentId } = req.body;

    if (!name || !slug) {
      res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
      return;
    }
    const category = await CategoryService.createCategory({
      name,
      slug,
      parentId: Number(parentId) || null,
    });
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await CategoryService.getCategoryById(Number(id));
    return res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

export const deleteAllCategories = async (req: Request, res: Response) => {
  try {
    // WARNING: This endpoint is for testing purposes only.
    await CategoryService.deleteAllCategories();
    res.status(200).json({
      success: true,
      message: "All categories deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

export const createCategoryAudiences = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { audienceIds, sort_order } = req.body; // Expecting an array of audience IDs

    if (!audienceIds || !Array.isArray(audienceIds)) {
      return res.status(400).json({
        success: false,
        message: "audienceIds must be an array",
      });
    }

    const result = await CategoryService.addAudiencesToCategory(
      Number(categoryId),
      audienceIds.map((id: any) => Number(id)),
      sort_order
    );
    res.status(200).json({
      success: true,
      message: "Audiences added to category successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

export const createCategoryAttributes = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { attributeIds } = req.body; // Expecting an array of attribute IDs

    if (!attributeIds || !Array.isArray(attributeIds)) {
      return res.status(400).json({
        success: false,
        message: "attributeIds must be an array",
      });
    }
    const result = await CategoryService.addAttributesToCategory(
      Number(categoryId),
      attributeIds.map((id: any) => Number(id))
    );
    res.status(200).json({
      success: true,
      message: "Attributes added to category successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

export const getCategoryByAudienceSlug = async (
  req: Request,
  res: Response
) => {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Slug is required",
      });
    }
    const category = await CategoryService.getCategoryByAudienceSlug(
      slug as string
    );
    return res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

export const getCategoryAttributes = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const attributes = await CategoryService.getCategoryAttributes(
      Number(categoryId)
    );
    return res.status(200).json({
      success: true,
      message: "Category attributes fetched successfully",
      data: attributes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, parentId } = req.body;

    const category = await CategoryService.updateCategory(Number(id), {
      name,
      slug,
      parentId: parentId ? Number(parentId) : undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await CategoryService.deleteCategory(Number(id));

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await CategoryService.getAllCategories();
    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

export const getCategoryAudiences = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const audiences = await CategoryService.getCategoryAudiences(
      Number(categoryId)
    );
    return res.status(200).json({
      success: true,
      message: "Category audiences fetched successfully",
      data: audiences,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};
