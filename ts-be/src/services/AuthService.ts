import { prisma } from "../lib/prisma.js";
import OTPService from "./OTPService.js";
import JWTService from "./JWTService.js";
import jwt from "jsonwebtoken";

interface RequestOTPData {
  identifier: string;
  fullName?: string;
}

interface VerifyOTPData {
  otpToken: string;
  otpCode: string;
}

class AuthService {
  /**
   * Request OTP - Xử lý cả signup và signin
   */
  static async requestOTP(data: RequestOTPData) {
    try {
      console.log("🔍 AuthService.requestOTP started with data:", data);
      const { identifier, fullName } = data;

      if (fullName) {
        // SIGNUP: Tạo user mới
        console.log("📝 Processing SIGNUP for:", identifier);

        // Kiểm tra user đã tồn tại chưa
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { phone: identifier }],
          },
        });

        if (existingUser) {
          console.log("❌ User already exists");
          return {
            success: false,
            message: "Tài khoản đã tồn tại, vui lòng đăng nhập",
          };
        }

        // Tạo user mới
        console.log("👤 Creating new user...");
        const isEmail = identifier.includes("@");

        if (!isEmail) {
          return {
            success: false,
            message: "Hiện tại hệ thống chỉ hỗ trợ đăng ký bằng Email.",
          };
        }

        const userData: any = {
          full_name: fullName,
          email: identifier,
        };

        const user = await prisma.user.create({
          data: userData,
        });

        console.log("✅ User saved successfully with ID:", user.id);

        // Gửi OTP
        const otpResult = await OTPService.generateAndSendOTP(
          user.id,
          identifier
        );

        if (!otpResult.success) {
          // Xóa user vừa tạo nếu gửi OTP thất bại
          await prisma.user.delete({ where: { id: user.id } });
          return otpResult;
        }

        // Tạo OTP session token
        const otpToken = jwt.sign(
          {
            userId: user.id,
            identifier: identifier,
            type: "otp_session",
          },
          process.env.JWT_ACCESS_SECRET || "access_secret_key",
          { expiresIn: "5m" }
        );

        return {
          success: true,
          message: "OTP đã được gửi đến email/số điện thoại của bạn",
          otpToken,
          isNewUser: true,
        };
      } else {
        // SIGNIN: Đăng nhập
        console.log("🔑 Processing SIGNIN for:", identifier);

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: identifier }, { phone: identifier }],
          },
        });

        if (!user) {
          console.log("❌ User not found");
          return {
            success: false,
            message: "Tài khoản không tồn tại, vui lòng đăng ký",
            requireSignup: true,
          };
        }

        // Gửi OTP
        const otpResult = await OTPService.generateAndSendOTP(
          user.id,
          identifier
        );

        if (!otpResult.success) {
          return otpResult;
        }

        const otpToken = jwt.sign(
          {
            userId: user.id,
            identifier: identifier,
            type: "otp_session",
          },
          process.env.JWT_ACCESS_SECRET || "access_secret_key",
          { expiresIn: "5m" }
        );

        return {
          success: true,
          message: "OTP đã được gửi",
          otpToken,
          isNewUser: false,
        };
      }
    } catch (error: any) {
      console.error("AuthService error:", error);
      return {
        success: false,
        message: "Lỗi xử lý yêu cầu",
        error: error.message,
      };
    }
  }

  /**
   * Verify OTP and Login
   */
  static async verifyOTPAndLogin(data: VerifyOTPData) {
    try {
      const { otpToken, otpCode } = data;

      // Verify otpToken
      let decoded: any;
      try {
        decoded = jwt.verify(
          otpToken,
          process.env.JWT_ACCESS_SECRET || "access_secret_key"
        );
      } catch (err) {
        return {
          success: false,
          message: "Phiên xác thực OTP đã hết hạn",
        };
      }

      const { userId, identifier } = decoded;

      // Verify OTP Code
      const verifyResult = await OTPService.verifyOTP(
        userId,
        identifier,
        otpCode
      );

      if (!verifyResult.success) {
        return verifyResult;
      }

      // Login success -> Generate Tokens
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return { success: false, message: "User không tồn tại" };
      }

      const tokens = JWTService.generateTokens({
        userId: user.id,
        role: user.role,
      });

      // Save Session
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken: tokens.refreshToken,
          expiresAt: expiresAt,
        },
      });

      // // Update last login
      // await prisma.user.update({
      //   where: { id: user.id },
      //   data: {
      //     lastLoginAt: new Date(),
      //     loginCount: { increment: 1 },
      //   },
      // });

      return {
        success: true,
        message: "Đăng nhập thành công",
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Lỗi đăng nhập",
        error: error.message,
      };
    }
  }

  /**
   * Refresh Token
   */
  static async refreshToken(refreshToken: string) {
    try {
      // Verify token signature
      const decoded = JWTService.verifyRefreshToken(refreshToken);

      // Check if session exists in DB
      const session = await prisma.session.findUnique({
        where: { refreshToken },
      });

      if (!session) {
        return {
          success: false,
          message: "Phiên đăng nhập không hợp lệ hoặc đã đăng xuất",
        };
      }

      if (session.expiresAt < new Date()) {
        // Delete expired session
        await prisma.session.delete({ where: { id: session.id } });
        return {
          success: false,
          message: "Phiên đăng nhập đã hết hạn",
        };
      }

      // Generate new access token
      const newAccessToken = JWTService.generateAccessToken({
        userId: decoded.userId,
        role: decoded.role,
      });

      return {
        success: true,
        accessToken: newAccessToken,
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Lỗi làm mới token",
        error: error.message,
      };
    }
  }

  /**
   * Resend OTP
   */
  static async resendOTP(data: { otpToken: string }) {
    try {
      const { otpToken } = data;
      let decoded: any;
      try {
        decoded = jwt.verify(
          otpToken,
          process.env.JWT_ACCESS_SECRET || "access_secret_key"
        );
      } catch (err) {
        return {
          success: false,
          message: "Phiên OTP đã hết hạn, vui lòng thực hiện lại từ đầu",
        };
      }

      const { userId, identifier } = decoded;
      return await OTPService.resendOTP(userId, identifier);
    } catch (error: any) {
      return {
        success: false,
        message: "Lỗi gửi lại OTP",
        error: error.message,
      };
    }
  }

  /**
   * Logout
   */
  static async logout(refreshToken: string) {
    try {
      await prisma.session.delete({
        where: { refreshToken },
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: "Lỗi đăng xuất" };
    }
  }

  /**
   * Logout All
   */
  static async logoutAll(userId: number) {
    try {
      await prisma.session.deleteMany({
        where: { userId },
      });
      return { success: true };
    } catch (error) {
      return { success: false, message: "Lỗi đăng xuất tất cả" };
    }
  }

  /**
   * Get Current User
   */
  static async getCurrentUser(userId: number) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      });

      if (!user) {
        return { success: false, message: "User not found" };
      }

      return {
        success: true,
        user,
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Lỗi lấy thông tin user",
        error: error.message,
      };
    }
  }
}

export default AuthService;
