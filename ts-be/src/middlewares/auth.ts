import { Request, Response, NextFunction } from "express";
import JWTService from "../services/JWTService.js";
import { prisma } from "../lib/prisma.js";
import { Role } from "../../generated/prisma/enums.js";

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token không tồn tại",
      });
      return;
    }

    // Verify access token
    const decoded = JWTService.verifyAccessToken(token);

    // Kiểm tra user còn tồn tại và active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: "Token không hợp lệ hoặc tài khoản đã bị khóa",
      });
      return;
    }

    // Gắn thông tin user vào request
    req.user = {
      userId: user.id,
      name: user.name,
      role: user.role,
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
};
