import { prisma } from "../lib/prisma.js";

class OTPService {
  /**
   * Tạo và gửi OTP mới
   */
  static async generateAndSendOTP(userId: number, identifier: string) {
    try {
      // Vô hiệu hóa tất cả OTP cũ của user này
      await prisma.oTP.updateMany({
        where: {
          userId: userId,
          identifier: identifier,
          isExpired: false,
          isUsed: false,
        },
        data: {
          isExpired: true,
        },
      });

      // Tạo OTP mới
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      const otpRecord = await prisma.oTP.create({
        data: {
          userId,
          code,
          identifier,
          expiresAt,
        },
      });

      // TODO: Gửi OTP qua email hoặc SMS ở đây
      console.log(`OTP for ${identifier}: ${otpRecord.code}`);

      return {
        success: true,
        message: "OTP đã được gửi thành công",
        expiresAt: otpRecord.expiresAt,
      };
    } catch (error: any) {
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
  static async verifyOTP(
    userId: number,
    identifier: string,
    inputCode: string
  ) {
    try {
      // Tìm OTP hợp lệ
      const otpRecord = await prisma.oTP.findFirst({
        where: {
          userId,
          identifier,
          isUsed: false,
          isExpired: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!otpRecord) {
        return {
          success: false,
          message: "Không tìm thấy OTP hợp lệ hoặc OTP đã hết hạn",
        };
      }

      // Kiểm tra số lần thử
      if (otpRecord.attempts >= 3) {
        await prisma.oTP.update({
          where: { id: otpRecord.id },
          data: { isExpired: true },
        });
        return {
          success: false,
          message:
            "Bạn đã nhập sai quá số lần quy định. Vui lòng yêu cầu OTP mới.",
        };
      }

      // Kiểm tra mã OTP
      if (otpRecord.code !== inputCode) {
        await prisma.oTP.update({
          where: { id: otpRecord.id },
          data: { attempts: { increment: 1 } },
        });
        return {
          success: false,
          message: "Mã OTP không chính xác",
          remainingAttempts: 3 - (otpRecord.attempts + 1),
        };
      }

      // OTP chính xác - đánh dấu đã sử dụng
      await prisma.oTP.update({
        where: { id: otpRecord.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      });

      return {
        success: true,
        message: "Xác thực OTP thành công",
      };
    } catch (error: any) {
      return {
        success: false,
        message: "Lỗi xác thực OTP",
        error: error.message,
      };
    }
  }

  /**
   * Resend OTP
   */
  static async resendOTP(userId: number, identifier: string) {
    try {
      // Kiểm tra thời gian gửi OTP gần nhất
      const latestOTP = await prisma.oTP.findFirst({
        where: {
          userId,
          identifier,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (latestOTP) {
        const timeSinceLastOTP = Date.now() - latestOTP.createdAt.getTime();
        const cooldownTime = 60 * 1000; // 1 minute

        if (timeSinceLastOTP < cooldownTime) {
          const remainingTime = Math.ceil(
            (cooldownTime - timeSinceLastOTP) / 1000
          );
          return {
            success: false,
            message: `Vui lòng chờ ${remainingTime} giây trước khi gửi lại OTP`,
          };
        }
      }

      return await this.generateAndSendOTP(userId, identifier);
    } catch (error: any) {
      return {
        success: false,
        message: "Lỗi gửi lại OTP",
        error: error.message,
      };
    }
  }

  /**
   * Check OTP Status
   */
  static async checkOTPStatus(userId: number, identifier: string) {
    try {
      const otpRecord = await prisma.oTP.findFirst({
        where: {
          userId,
          identifier,
          isUsed: false,
          isExpired: false,
          expiresAt: {
            gt: new Date(),
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        hasValidOTP: !!otpRecord,
        expiresAt: otpRecord?.expiresAt,
        attempts: otpRecord?.attempts || 0,
        remainingAttempts: otpRecord ? 3 - otpRecord.attempts : 0,
      };
    } catch (error: any) {
      throw new Error(`Error checking OTP status: ${error.message}`);
    }
  }
}

export default OTPService;
