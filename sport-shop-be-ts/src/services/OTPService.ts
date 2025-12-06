import prisma from "../config/prisma";

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
  static async verifyOTP(userId: number, identifier: string, inputCode: string) {
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
          message: "Bạn đã nhập sai quá số lần quy định. Vui lòng yêu cầu OTP mới.",
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
        };
      }

      // OTP hợp lệ -> Đánh dấu đã sử dụng
      await prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { isUsed: true, usedAt: new Date() },
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
   * Kiểm tra OTP còn hợp lệ không
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
        canResend: false, // Logic resend có thể phức tạp hơn nếu cần
      };
    } catch (error: any) {
      return {
        exists: false,
        message: "Lỗi kiểm tra OTP",
        error: error.message,
      };
    }
  }

  /**
   * Resend OTP (chỉ cho phép sau 1 phút) - Logic này có thể cần thêm trường lastSentAt nếu muốn chặt chẽ
   * Hiện tại chỉ gọi lại generateAndSendOTP
   */
  static async resendOTP(userId: number, identifier: string) {
    return this.generateAndSendOTP(userId, identifier);
  }
}

export default OTPService;
