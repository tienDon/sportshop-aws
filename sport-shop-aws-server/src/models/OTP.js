import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    // User reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // OTP code
    code: {
      type: String,
      required: true,
      length: 6,
    },

    // // Loại OTP
    // type: {
    //   type: String,
    //   enum: ["email", "phone"],
    //   required: true,
    // },

    // Thông tin liên hệ được gửi OTP
    identifier: {
      type: String,
      required: true, // email hoặc phone number
    },

    // Trạng thái
    isUsed: {
      type: Boolean,
      default: false,
    },

    isExpired: {
      type: Boolean,
      default: false,
    },

    // Thời gian
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 phút
    },

    usedAt: {
      type: Date,
      default: null,
    },

    // Số lần thử sai
    attempts: {
      type: Number,
      default: 0,
      max: 3,
    },

    // // IP address và user agent để security
    // ipAddress: {
    //   type: String,
    //   default: null,
    // },

    // userAgent: {
    //   type: String,
    //   default: null,
    // },
  },
  {
    timestamps: true,
  }
);

// Indexes
otpSchema.index({ userId: 1 });
otpSchema.index({ identifier: 1 });
otpSchema.index({ code: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto delete khi hết hạn
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 }); // Auto delete sau 24h

// Instance methods
otpSchema.methods.verify = function (inputCode) {
  // Kiểm tra đã sử dụng
  if (this.isUsed) {
    return { success: false, message: "OTP đã được sử dụng" };
  }

  // Kiểm tra hết hạn (check tại runtime)
  if (this.isExpired || this.expiresAt < new Date()) {
    this.isExpired = true;
    return { success: false, message: "OTP đã hết hạn" };
  }

  // Kiểm tra số lần thử
  if (this.attempts >= 3) {
    return { success: false, message: "Đã vượt quá số lần thử cho phép" };
  }

  // Kiểm tra mã OTP
  if (this.code !== inputCode) {
    this.attempts += 1;
    return { success: false, message: "Mã OTP không chính xác" };
  }

  // Xác thực thành công
  this.isUsed = true;
  this.usedAt = new Date();

  return { success: true, message: "Xác thực thành công" };
};

otpSchema.methods.markAsExpired = function () {
  this.isExpired = true;
  this.save();
};

// Static methods
otpSchema.statics.generateOTP = function (userId, identifier, metadata = {}) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  return new this({
    userId,
    code,
    identifier,
    // ipAddress: metadata.ipAddress,
    // userAgent: metadata.userAgent,
  });
};

otpSchema.statics.findValidOTP = function (userId, identifier) {
  return this.findOne({
    userId,
    identifier,
    isUsed: false,
    isExpired: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 3 },
  }).sort({ createdAt: -1 }); // Lấy OTP mới nhất
};

otpSchema.statics.invalidateAllOTP = function (userId, identifier) {
  return this.updateMany(
    {
      userId,
      identifier,
      isUsed: false,
    },
    {
      isExpired: true,
    }
  );
};

// Cleanup expired OTPs
otpSchema.statics.cleanupExpired = function () {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isExpired: true },
      { createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }, // 24h cũ
    ],
  });
};

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
