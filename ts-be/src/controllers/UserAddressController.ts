import { Request, Response } from "express";
import { UserAddressService } from "../services/UserAddressService.js";

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const addresses = await UserAddressService.getAddresses(userId);
    res.json({ success: true, data: addresses });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { address_detail, is_default } = req.body;
    if (!address_detail) {
      return res.status(400).json({ message: "Address detail is required" });
    }
    const address = await UserAddressService.createAddress(userId, {
      address_detail,
      is_default,
    });
    res.status(201).json({ success: true, data: address });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const addressId = parseInt(req.params.id);
    const { address_detail, is_default } = req.body;
    const address = await UserAddressService.updateAddress(userId, addressId, {
      address_detail,
      is_default,
    });
    res.json({ success: true, data: address });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const addressId = parseInt(req.params.id);
    await UserAddressService.deleteAddress(userId, addressId);
    res.json({ success: true, message: "Address deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
