import { Request, Response } from "express";
import { ApiResponse } from "../types/index.js";
import AuthService from "../services/AuthService.js";
import OTPService from "../services/OTPService.js";

export const requestOtp = async (req: Request, res: Response) => {
  try {
    const { identifier, full_name } = req.body;

    // Validation
    if (!identifier) {
      res.status(400).json({
        success: false,
        message: "Email hoặc số điện thoại là bắt buộc",
      });
      return;
    }

    // Validate email or phone format
    const isEmail = identifier.includes("@");
    if (isEmail) {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(identifier)) {
        res.status(400).json({
          success: false,
          message: "Email không hợp lệ",
        });
        return;
      }
    } else {
      const phoneRegex = /^(\+84|84|0)[1-9][0-9]{8}$/;
      if (!phoneRegex.test(identifier)) {
        res.status(400).json({
          success: false,
          message: "Số điện thoại không hợp lệ",
        });
        return;
      }
    }

    // Validate name cho signup
    if (
      full_name &&
      (full_name.trim().length < 2 || full_name.trim().length > 50)
    ) {
      res.status(400).json({
        success: false,
        message: "Tên phải từ 2-50 ký tự",
      });
      return;
    }

    const result = await AuthService.requestOTP({ identifier, full_name });

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { otpToken, otpCode } = req.body;

    // Validation
    if (!otpToken || !otpCode) {
      res.status(400).json({
        success: false,
        message: "Thiếu thông tin xác thực",
      });
      return;
    }

    if (otpCode.length !== 6) {
      res.status(400).json({
        success: false,
        message: "Mã OTP phải có 6 chữ số",
      });
      return;
    }

    const result = await AuthService.verifyOTPAndLogin({
      otpToken,
      otpCode,
    });

    if (result.success) {
      // Check if result has refreshToken (successful login)
      if ("refreshToken" in result && result.refreshToken) {
        // Set refresh token vào httpOnly cookie
        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Không trả refresh token trong response body
        const { refreshToken, ...responseData } = result;
        res.status(200).json(responseData);
      } else {
        // Success but no tokens (shouldn't happen, but handle it)
        res.status(200).json(result);
      }
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: "Refresh token không tồn tại",
      });
      return;
    }

    const result = await AuthService.refreshToken(refreshToken);

    if (result.success) {
      res.status(200).json(result);
    } else {
      // Clear invalid refresh token
      res.clearCookie("refreshToken");
      res.status(401).json(result);
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { otpToken } = req.body;

    // Validation
    if (!otpToken) {
      res.status(400).json({
        success: false,
        message: "Thiếu OTP token",
      });
      return;
    }

    const result = await AuthService.resendOTP({ otpToken });

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // Xóa session từ database
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

export const logoutAll = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    // Xóa tất cả session của user
    await AuthService.logoutAll(userId);

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "Đăng xuất khỏi tất cả thiết bị thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

export const checkOTPStatus = async (req: Request, res: Response) => {
  try {
    const { userId, identifier } = req.body;

    // Validation
    if (!userId || !identifier) {
      res.status(400).json({
        success: false,
        message: "Thiếu thông tin",
      });
      return;
    }

    const result = await OTPService.checkOTPStatus(userId, identifier);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const result = await AuthService.getCurrentUser(userId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi server",
      error: error.message,
    });
  }
};
