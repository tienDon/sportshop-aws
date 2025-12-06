import { AttributeService } from "@/services/AttributeService.js";
import { Request, Response } from "express";

export const getAllAttributes = async (req: Request, res: Response) => {
  try {
    const attributes = await AttributeService.getAllAttributes();
    return res.status(200).json({
      success: true,
      message: "Fetched all attributes successfully",
      data: attributes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching attributes",
      error: (error as Error).message,
    });
  }
};
export const createAttribute = async (req: Request, res: Response) => {
  try {
    const { name, code } = req.body;
    if (!name || !code || code.trim() === "" || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Name and code are required",
      });
    }
    const attribute = await AttributeService.createAttribute(name, code);
    return res.status(201).json({
      success: true,
      message: "Attribute created successfully",
      data: attribute,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating attribute",
      error: (error as Error).message,
    });
  }
};
export const createAttributeValues = async (req: Request, res: Response) => {
  try {
    const { attributeId } = req.params;
    const { value } = req.body;
    const attributeValues = await AttributeService.createAttributeValues(
      parseInt(attributeId),
      value
    );
    return res.status(201).json({
      success: true,
      message: "Attribute values created successfully",
      data: attributeValues,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating attribute values",
      error: (error as Error).message,
    });
  }
};
export const getAttributeValuesByAttributeId = async (
  req: Request,
  res: Response
) => {
  try {
    const { attributeId } = req.params;
    if (!attributeId) {
      return res.status(400).json({
        success: false,
        message: "Attribute ID is required",
      });
    }
    const attributeValues =
      await AttributeService.getAttributeValuesByAttributeId(
        parseInt(attributeId)
      );
    return res.status(200).json({
      success: true,
      message: "Fetched attribute values successfully",
      data: attributeValues,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching attribute values",
      error: (error as Error).message,
    });
  }
};

export const getAttributesWithValues = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    const attributes = await AttributeService.getAttributesWithValues(
      code as string
    );
    return res.status(200).json({
      success: true,
      message: "Fetched attributes with values successfully",
      data: attributes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching attributes with values",
      error: (error as Error).message,
    });
  }
};

export const deleteAllAttributes = async (req: Request, res: Response) => {
  try {
    const result = await AttributeService.deleteAllAttributes();
    return res.status(200).json({
      success: true,
      message: "All attributes deleted successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting all attributes",
      error: (error as Error).message,
    });
  }
};

export const deleteAttribute = async (req: Request, res: Response) => {
  try {
    const { attributeId } = req.params;
    if (!attributeId) {
      return res.status(400).json({
        success: false,
        message: "Attribute ID is required",
      });
    }
    const result = await AttributeService.deleteAttribute(
      parseInt(attributeId)
    );
    return res.status(200).json({
      success: true,
      message: "Attribute deleted successfully",
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting attribute",
      error: (error as Error).message,
    });
  }
};
