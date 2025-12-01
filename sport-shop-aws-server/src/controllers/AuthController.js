import AuthService from "../services/AuthService.js";
import OTPService from "../services/OTPService.js";
import User from "../models/User.js";

class AuthController {
  /**
   * Request OTP - POST /api/auth/request-otp
   * Body: { identifier: "email/phone", name?: "string" }
   */
  static async requestOTP(req, res) {
    try {
      const { identifier, name } = req.body;

      // Validation
      if (!identifier) {
        return res.status(400).json({
          success: false,
          message: "Email hoặc số điện thoại là bắt buộc",
        });
      }

      // Validate email or phone format
      const isEmail = identifier.includes("@");
      if (isEmail) {
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(identifier)) {
          return res.status(400).json({
            success: false,
            message: "Email không hợp lệ",
          });
        }
      } else {
        const phoneRegex = /^(\+84|84|0)[1-9][0-9]{8}$/;
        if (!phoneRegex.test(identifier)) {
          return res.status(400).json({
            success: false,
            message: "Số điện thoại không hợp lệ",
          });
        }
      }

      // Validate name cho signup
      if (name && (name.trim().length < 2 || name.trim().length > 50)) {
        return res.status(400).json({
          success: false,
          message: "Tên phải từ 2-50 ký tự",
        });
      }

      const result = await AuthService.requestOTP({ identifier, name });

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }

  /**
   * Verify OTP - POST /api/auth/verify-otp
   * Body: { otpToken, otpCode }
   */
  static async verifyOTP(req, res) {
    try {
      const { otpToken, otpCode } = req.body;

      // Validation
      if (!otpToken || !otpCode) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin xác thực",
        });
      }

      if (otpCode.length !== 6) {
        return res.status(400).json({
          success: false,
          message: "Mã OTP phải có 6 chữ số",
        });
      }

      const result = await AuthService.verifyOTPAndLogin({
        otpToken,
        otpCode,
      });

      if (result.success) {
        // Set refresh token vào httpOnly cookie
        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production", // Chỉ HTTPS trong production
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // none cho cross-domain trong production
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Không trả refresh token trong response body
        const { refreshToken, ...responseData } = result;

        return res.status(200).json(responseData);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }

  /**
   * Refresh Token - POST /api/auth/refresh-token
   */
  static async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Refresh token không tồn tại",
        });
      }

      const result = await AuthService.refreshToken(refreshToken);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        // Clear invalid refresh token
        res.clearCookie("refreshToken");
        return res.status(401).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }

  /**
   * Resend OTP - POST /api/auth/resend-otp
   * Body: { otpToken }
   */
  static async resendOTP(req, res) {
    try {
      const { otpToken } = req.body;

      // Validation
      if (!otpToken) {
        return res.status(400).json({
          success: false,
          message: "Thiếu OTP token",
        });
      }

      const result = await AuthService.resendOTP({ otpToken });

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }

  /**
   * Logout - POST /api/auth/logout
   */
  static async logout(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;

      // Xóa session từ database
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      // Clear refresh token cookie
      res.clearCookie("refreshToken");

      return res.status(200).json({
        success: true,
        message: "Đăng xuất thành công",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }

  /**
   * Check OTP Status - POST /api/auth/check-otp-status
   * Body: { userId, identifier }
   */
  static async checkOTPStatus(req, res) {
    try {
      const { userId, identifier } = req.body;

      // Validation
      if (!userId || !identifier) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin",
        });
      }

      const result = await OTPService.checkOTPStatus(userId, identifier);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }

  /**
   * Logout All - POST /api/auth/logout-all
   */
  static async logoutAll(req, res) {
    try {
      const userId = req.user.userId;

      // Xóa tất cả session của user
      await AuthService.logoutAll(userId);

      // Clear refresh token cookie
      res.clearCookie("refreshToken");

      return res.status(200).json({
        success: true,
        message: "Đăng xuất khỏi tất cả thiết bị thành công",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }

  /**
   * Get current user info - GET /api/auth/me
   */
  static async getMe(req, res) {
    try {
      const userId = req.user.userId;

      const result = await AuthService.getCurrentUser(userId);

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(404).json(result);
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi server",
        error: error.message,
      });
    }
  }
}

export default AuthController;
