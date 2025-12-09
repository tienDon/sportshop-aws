import { Request, Response } from "express";
import { UserPhoneService } from "../services/UserPhoneService.js";

export const getPhones = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const phones = await UserPhoneService.getPhones(userId);
    res.json({ success: true, data: phones });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPhone = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { phone_number, is_default } = req.body;
    if (!phone_number) {
      return res.status(400).json({ message: "Phone number is required" });
    }
    const phone = await UserPhoneService.createPhone(userId, {
      phone_number,
      is_default,
    });
    res.status(201).json({ success: true, data: phone });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePhone = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const phoneId = parseInt(req.params.id);
    const { phone_number, is_default } = req.body;
    const phone = await UserPhoneService.updatePhone(userId, phoneId, {
      phone_number,
      is_default,
    });
    res.json({ success: true, data: phone });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePhone = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const phoneId = parseInt(req.params.id);
    await UserPhoneService.deletePhone(userId, phoneId);
    res.json({ success: true, message: "Phone deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserForAdmin = async (req: Request, res: Response) => {
  try {
    const users = await UserPhoneService.getUserForAdmin();
    return res.status(200).json({
      success: true,
      message: "Fetch data users for admin successfully",
      data: users,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    // const {isActive} = req.body;
    const updatedUser = await UserPhoneService.updateUserStatus(userId);
    return res.status(200).json({
      success: true,
      message: "Update user successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const deletedUser = await UserPhoneService.deleteUser(userId);
    return res.status(200).json({
      success: true,
      message: "Delete user successfully",
      data: deletedUser,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
