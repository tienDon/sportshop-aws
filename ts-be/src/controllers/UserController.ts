import { Request, Response } from "express";
import { prisma } from "@/lib/prisma.js";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({});
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách người dùng",
      error: error.message,
    });
  }
};
