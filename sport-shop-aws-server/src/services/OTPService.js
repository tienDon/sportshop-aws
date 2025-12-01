import OTP from "../models/OTP.js";
import User from "../models/User.js";

class OTPService {
  /**
   * Tạo và gửi OTP mới
   */
  static async generateAndSendOTP(userId, identifier, metadata = {}) {
    try {
      // Vô hiệu hóa tất cả OTP cũ của user này
      await OTP.invalidateAllOTP(userId, identifier);

      // Tạo OTP mới
      const otpRecord = new OTP({
        userId,
        code: Math.floor(100000 + Math.random() * 900000).toString(),
        identifier,
      });
      await otpRecord.save();

      // TODO: Gửi OTP qua email hoặc SMS ở đây
      console.log(`OTP for ${identifier}: ${otpRecord.code}`);

      return {
        success: true,
        message: "OTP đã được gửi thành công",
        expiresAt: otpRecord.expiresAt,
      };
    } catch (error) {
      return {
        success: false,
        message: "Không thể tạo OTP",
        error: error.message,
      };
    }
  }

  /**
   * Xác thực OTP
   */
  static async verifyOTP(userId, identifier, inputCode) {
    try {
      // Tìm OTP hợp lệ
      const otpRecord = await OTP.findValidOTP(userId, identifier);

      if (!otpRecord) {
        return {
          success: false,
          message: "Không tìm thấy OTP hợp lệ hoặc OTP đã hết hạn",
        };
      }

      // Xác thực OTP
      const verificationResult = otpRecord.verify(inputCode);
      await otpRecord.save();

      return verificationResult;
    } catch (error) {
      return {
        success: false,
        message: "Lỗi xác thực OTP",
        error: error.message,
      };
    }
  }

  /**
   * Kiểm tra OTP còn hợp lệ không
   */
  static async checkOTPStatus(userId, identifier) {
    try {
      const otpRecord = await OTP.findValidOTP(userId, identifier);

      if (!otpRecord) {
        return {
          exists: false,
          message: "Không có OTP hợp lệ",
        };
      }

      return {
        exists: true,
        expiresAt: otpRecord.expiresAt,
        attemptsLeft: 3 - otpRecord.attempts,
        canResend: false, // Chỉ cho phép resend sau khi hết hạn hoặc quá 1 phút
      };
    } catch (error) {
      return {
        exists: false,
        message: "Lỗi kiểm tra OTP",
        error: error.message,
      };
    }
  }

  /**
   * Resend OTP (chỉ cho phép sau 1 phút)
   */
  static async resendOTP(userId, identifier, metadata = {}) {
    try {
      const lastOTP = await OTP.findOne({
        userId,

        identifier,
      }).sort({ createdAt: -1 });

      // Kiểm tra thời gian gửi cuối
      if (lastOTP && lastOTP.createdAt > new Date(Date.now() - 60 * 1000)) {
        return {
          success: false,
          message: "Vui lòng chờ 1 phút trước khi gửi lại OTP",
        };
      }

      return await this.generateAndSendOTP(userId, identifier, metadata);
    } catch (error) {
      return {
        success: false,
        message: "Không thể gửi lại OTP",
        error: error.message,
      };
    }
  }

  /**
   * Cleanup OTP hết hạn (chạy định kỳ)
   */
  static async cleanupExpiredOTP() {
    try {
      const result = await OTP.cleanupExpired();
      console.log(`Cleaned up ${result.deletedCount} expired OTP records`);
      return result;
    } catch (error) {
      console.error("Error cleaning up OTP:", error);
      return null;
    }
  }

  /**
   * Hủy tất cả OTP của user
   */
  static async invalidateUserOTPs(userId) {
    try {
      await OTP.updateMany({ userId, isUsed: false }, { isExpired: true });

      return {
        success: true,
        message: "Đã hủy tất cả OTP của user",
      };
    } catch (error) {
      return {
        success: false,
        message: "Không thể hủy OTP",
        error: error.message,
      };
    }
  }
}

export default OTPService;
