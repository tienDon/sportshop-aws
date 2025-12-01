import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Thông tin cơ bản
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    // Thông tin liên hệ - ít nhất 1 trong 2 phải có
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: null, // Luôn có field email, mặc định là null
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Email không hợp lệ",
      ],
    },

    phone: {
      type: String,
      trim: true,
      default: null, // Luôn có field phone, mặc định là null
      match: [/^(\+84|84|0)[1-9][0-9]{8}$/, "Số điện thoại không hợp lệ"],
    },

    // // Trạng thái xác thực
    // isVerified: {
    //   type: Boolean,
    //   default: false,
    // },

    // Trạng thái tài khoản
    isActive: {
      type: Boolean,
      default: true,
    },

    // Phân quyền
    role: {
      type: String,
      enum: ["admin", "customer"],
      default: "customer",
    },

    // Thông tin bổ sung
    avatar: {
      type: String,
      default: null,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
    },

    // Địa chỉ
    addresses: [
      {
        type: {
          type: String,
          enum: ["home", "work", "other"],
          default: "home",
        },
        street: String,
        city: String,
        district: String,
        ward: String,
        postalCode: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Thống kê
    lastLoginAt: {
      type: Date,
      default: null,
    },

    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

// Indexes for performance
userSchema.index({ email: 1 }, { sparse: true });
userSchema.index({ phone: 1 }, { sparse: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Instance methods - simplified for login tracking only
userSchema.methods.updateLoginInfo = function () {
  this.lastLoginAt = new Date();
  this.loginCount += 1;
};

// Static methods
userSchema.statics.findByEmailOrPhone = function (identifier) {
  return this.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
    isActive: true,
  });
};

// Virtual for full verification status
// userSchema.virtual("isFullyVerified").get(function () {
//   if (this.email || this.phone) {
//     return this.isVerified;
//   }
//   return false;
// });

// Ensure virtual fields are serialized
userSchema.set("toJSON", {
  virtuals: true,
});

const User = mongoose.model("User", userSchema);

export default User;
