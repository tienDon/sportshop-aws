import { Request, Response } from "express";
import AuthService from "../services/AuthService";

export const requestOtp = async (req: Request, res: Response) => {
  try {
    const { identifier, name } = req.body;
    if (!identifier) {
      res
        .status(400)
        .json({ success: false, message: "Vui lòng cung cấp email hoặc số điện thoại" });
      return;
    }

    const result = await AuthService.requestOTP({ identifier, name });
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { otpToken, otpCode } = req.body;
    if (!otpToken || !otpCode) {
      res.status(400).json({ success: false, message: "Thiếu thông tin xác thực" });
      return;
    }

    const result = await AuthService.verifyOTPAndLogin({ otpToken, otpCode });
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { otpToken } = req.body;
    if (!otpToken) {
      res.status(400).json({ success: false, message: "Thiếu otpToken" });
      return;
    }

    const result = await AuthService.resendOTP({ otpToken });
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const checkOTPStatus = async (req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented yet" });
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, message: "Thiếu refreshToken" });
      return;
    }

    const result = await AuthService.refreshToken(refreshToken);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }
    res.status(200).json({ success: true, message: "Đăng xuất thành công" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const result = await AuthService.getCurrentUser(userId);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};
