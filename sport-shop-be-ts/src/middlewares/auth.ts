import { Request, Response, NextFunction } from "express";
import JWTService from "../services/JWTService";
import prisma from "../config/prisma";
import { Role } from "@prisma/client";

/**
 * Middleware xác thực JWT token
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
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
    res.status(403).json({
      success: false,
      message: "Token không hợp lệ",
      error: error.message,
    });
  }
};

/**
 * Middleware kiểm tra quyền admin
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== Role.ADMIN) {
    res.status(403).json({
      success: false,
      message: "Không có quyền truy cập",
    });
    return;
  }
  next();
};

/**
 * Middleware optional authentication - không bắt buộc phải có token
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      try {
        const decoded = JWTService.verifyAccessToken(token);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
        });

        if (user && user.isActive) {
          req.user = {
            userId: user.id,
            name: user.name,
            role: user.role,
          };
        }
      } catch (err) {
        // Ignore token errors
      }
    }

    next();
  } catch (error) {
    // Ignore errors for optional auth
    next();
  }
};
