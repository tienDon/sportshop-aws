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
