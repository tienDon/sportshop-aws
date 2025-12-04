import User from "../models/User.js";
import OTPService from "./OTPService.js";
import JWTService from "./JWTService.js";
import Session from "../models/Session.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const ACCESS_TOKEN_EXPIRES_IN = "15m";

class AuthService {
  /**
   * Request OTP - Xử lý cả signup và signin
   * Nếu có name => signup (tạo user mới)
   * Nếu không có name => signin (kiểm tra user tồn tại)
   */
  static async requestOTP(data) {
    try {
      console.log("🔍 AuthService.requestOTP started with data:", data);
      const { identifier, name } = data; // identifier = email hoặc phone

      if (name) {
        // SIGNUP: Tạo user mới
        console.log("📝 Processing SIGNUP for:", identifier);

        // Kiểm tra user đã tồn tại chưa
        console.log("🔍 Checking if user exists...");
        const existingUser = await User.findByEmailOrPhone(identifier);
        if (existingUser) {
          console.log("❌ User already exists");
          return {
            success: false,
            message: "Tài khoản đã tồn tại, vui lòng đăng nhập",
          };
        }

        // Tạo user mới nhưng chưa lưu vào DB
        console.log("👤 Creating new user...");
        const isEmail = identifier.includes("@");
        const userData = {
          name,
          [isEmail ? "email" : "phone"]: identifier,
        };
        console.log("📋 User data:", userData);

        // Validate data trước khi tạo user
        if (!userData.email && !userData.phone) {
          console.log("❌ Validation failed: No email or phone");
          return {
            success: false,
            message: "Phải có ít nhất email hoặc số điện thoại",
          };
        }

        // Kiểm tra unique cho email/phone (double check)
        if (userData.email) {
          const emailExists = await User.findOne({ email: userData.email });
          if (emailExists) {
            console.log("❌ Email already exists (double check)");
            return {
              success: false,
              message: "Email đã được sử dụng",
            };
          }
        }

        if (userData.phone) {
          const phoneExists = await User.findOne({ phone: userData.phone });
          if (phoneExists) {
            console.log("❌ Phone already exists (double check)");
            return {
              success: false,
              message: "Số điện thoại đã được sử dụng",
            };
          }
        }

        const user = new User(userData);
        console.log("💾 Saving user to database...");
        await user.save();
        console.log("✅ User saved successfully with ID:", user._id);

        // Gửi OTP
        const otpResult = await OTPService.generateAndSendOTP(
          user._id,
          identifier
        );

        if (!otpResult.success) {
          // Xóa user vừa tạo nếu gửi OTP thất bại
          await User.findByIdAndDelete(user._id);
          return otpResult;
        }

        // Tạo OTP session token (hết hạn cùng với OTP)
        const otpToken = jwt.sign(
          {
            userId: user._id,
            identifier: identifier,
            type: "otp_session",
          },
          process.env.JWT_ACCESS_SECRET || "access_secret_key",
          { expiresIn: ACCESS_TOKEN_EXPIRES_IN } // Cùng thời gian với OTP
        );

        return {
          success: true,
          message:
            "Tài khoản được tạo thành công. Vui lòng nhập mã OTP để xác thực",
          otpToken: otpToken,
          expiresAt: otpResult.expiresAt,
        };
      } else {
        // SIGNIN: Kiểm tra user tồn tại

        const user = await User.findByEmailOrPhone(identifier);
        if (!user) {
          return {
            success: false,
            message: "Tài khoản không tồn tại, vui lòng đăng ký",
          };
        }

        // Gửi OTP
        const otpResult = await OTPService.generateAndSendOTP(
          user._id,
          identifier
        );

        if (!otpResult.success) {
          return otpResult;
        }

        // Tạo OTP session token
        const otpToken = jwt.sign(
          {
            userId: user._id,
            identifier: identifier,
            type: "otp_session",
          },
          process.env.JWT_ACCESS_SECRET || "access_secret_key",
          { expiresIn: ACCESS_TOKEN_EXPIRES_IN } // Cùng thời gian với OTP
        );

        return {
          success: true,
          message: "Mã OTP đã được gửi đến " + identifier,
          otpToken: otpToken,
          expiresAt: otpResult.expiresAt,
        };
      }
    } catch (error) {
      console.error("❌ AuthService.requestOTP error:", error);
      console.error("❌ Error stack:", error.stack);
      return {
        success: false,
        message: "Lỗi xử lý yêu cầu",
        error: error.message,
      };
    }
  }

  /**
   * Verify OTP và đăng nhập
   */
  static async verifyOTPAndLogin(data) {
    try {
      const { otpToken, otpCode } = data;

      // Verify OTP session token
      let decoded;
      try {
        decoded = jwt.verify(
          otpToken,
          process.env.JWT_ACCESS_SECRET || "access_secret_key"
        );
      } catch (error) {
        return {
          success: false,
          message: "OTP session đã hết hạn, vui lòng yêu cầu mã mới",
        };
      }

      // Kiểm tra token type
      if (decoded.type !== "otp_session") {
        return {
          success: false,
          message: "Token không hợp lệ",
        };
      }

      const { userId, identifier } = decoded;

      // Verify OTP
      const otpResult = await OTPService.verifyOTP(userId, identifier, otpCode);

      if (!otpResult.success) {
        return otpResult;
      }

      // Lấy thông tin user
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: "Người dùng không tồn tại",
        };
      }

      // Cập nhật thông tin đăng nhập
      user.updateLoginInfo();
      await user.save();

      // Tạo JWT access token
      const accessToken = jwt.sign(
        { userId: user._id, name: user.name },
        process.env.JWT_ACCESS_SECRET || "access_secret_key",
        { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
      );

      // Tạo refresh token bằng crypto
      const refreshToken = crypto.randomBytes(64).toString("hex");

      // Lưu refresh token vào session table
      await Session.create({
        userId: user._id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      // Trả về user info tối thiểu
      const userInfo = {
        _id: user._id,
        name: user.name,
        role: user.role,
      };

      return {
        success: true,
        message: "Đăng nhập thành công",
        user: userInfo,
        accessToken,
        refreshToken, // Sẽ được xử lý riêng trong controller
      };
    } catch (error) {
      return {
        success: false,
        message: "Lỗi xác thực OTP",
        error: error.message,
      };
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken) {
    try {
      // Verify refresh token từ session table
      const session = await Session.findOne({
        refreshToken,
        expiresAt: { $gt: new Date() },
      }).populate("userId");

      if (!session) {
        return {
          success: false,
          message: "Refresh token không hợp lệ hoặc đã hết hạn",
        };
      }

      // Kiểm tra user còn tồn tại và active
      const user = session.userId;
      if (!user || !user.isActive) {
        // Xóa session không hợp lệ
        await Session.deleteOne({ _id: session._id });
        return {
          success: false,
          message: "Token không hợp lệ",
        };
      }

      // Tạo access token mới với payload tối thiểu
      const accessToken = jwt.sign(
        { userId: user._id, name: user.name },
        process.env.JWT_ACCESS_SECRET || "access_secret_key",
        { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
      );

      return {
        success: true,
        accessToken,
      };
    } catch (error) {
      return {
        success: false,
        message: "Refresh token không hợp lệ",
        error: error.message,
      };
    }
  }

  /**
   * Resend OTP
   */
  static async resendOTP(data) {
    try {
      const { otpToken } = data;

      // Verify OTP session token
      let decoded;
      try {
        decoded = jwt.verify(
          otpToken,
          process.env.JWT_ACCESS_SECRET || "access_secret_key"
        );
      } catch (error) {
        return {
          success: false,
          message: "OTP session đã hết hạn, vui lòng yêu cầu mã mới",
        };
      }

      const { userId, identifier } = decoded;

      // Kiểm tra user tồn tại
      const user = await User.findById(userId);
      if (!user) {
        return {
          success: false,
          message: "Người dùng không tồn tại",
        };
      }

      // Gửi lại OTP
      const result = await OTPService.resendOTP(userId, identifier);

      if (result.success) {
        // Tạo OTP token mới với thời gian hết hạn mới
        const newOtpToken = jwt.sign(
          {
            userId: userId,
            identifier: identifier,
            type: "otp_session",
          },
          process.env.JWT_ACCESS_SECRET || "access_secret_key",
          { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
        );

        return {
          ...result,
          otpToken: newOtpToken,
        };
      }

      return result;
    } catch (error) {
      return {
        success: false,
        message: "Lỗi gửi lại OTP",
        error: error.message,
      };
    }
  }

  /**
   * Logout - Xóa session
   */
  static async logout(refreshToken) {
    try {
      if (refreshToken) {
        // Xóa session từ database
        await Session.deleteOne({ refreshToken });
      }

      return {
        success: true,
        message: "Đăng xuất thành công",
      };
    } catch (error) {
      return {
        success: false,
        message: "Lỗi đăng xuất",
        error: error.message,
      };
    }
  }

  /**
   * Logout All - Xóa tất cả session của user
   */
  static async logoutAll(userId) {
    try {
      // Xóa tất cả session của user
      await Session.deleteMany({ userId });

      return {
        success: true,
        message: "Đăng xuất khỏi tất cả thiết bị thành công",
      };
    } catch (error) {
      return {
        success: false,
        message: "Lỗi đăng xuất",
        error: error.message,
      };
    }
  }

  /**
   * Get current user info
   */
  static async getCurrentUser(userId) {
    try {
      // Lấy thông tin đầy đủ của user từ database
      const user = await User.findById(userId).select("-__v");

      if (!user) {
        return {
          success: false,
          message: "Người dùng không tồn tại",
        };
      }

      // Trả về thông tin đầy đủ của user
      const userInfo = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        addresses: user.addresses,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return {
        success: true,
        user: userInfo,
      };
    } catch (error) {
      return {
        success: false,
        message: "Lỗi lấy thông tin người dùng",
        error: error.message,
      };
    }
  }
}

export default AuthService;
