import { Request, Response } from "express";
import { OrderService } from "../services/OrderService.js";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { cartId, shippingAddressId, userPhoneId, note } = req.body;

    if (!cartId || !shippingAddressId || !userPhoneId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const order = await OrderService.createOrder({
      userId,
      cartId,
      shippingAddressId,
      userPhoneId,
      note,
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await OrderService.getOrders(userId, page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await OrderService.getOrderById(orderId, userId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    console.error("Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
