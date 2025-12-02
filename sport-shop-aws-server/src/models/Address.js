import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address_details: {
      // Gom nhóm lại cho gọn
      street: { type: String, required: true, trim: true },
      ward: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      country: { type: String, default: "Vietnam", trim: true },
    },
    is_default: {
      type: Boolean,
      default: false,
    },
    is_billing: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
addressSchema.index({ user_id: 1 });
addressSchema.index({ user_id: 1, is_default: 1 });
addressSchema.index({ user_id: 1, is_billing: 1 }); // Thêm Index cho billing

// Pre-save middleware để đảm bảo chỉ có 1 address mặc định và 1 address thanh toán
addressSchema.pre("save", async function (next) {
  const self = this;

  // 1. Logic cho Địa chỉ Mặc định (is_default)
  if (self.is_default) {
    // Đặt tất cả địa chỉ khác của user này thành non-default
    await self
      .model("Address")
      .updateMany(
        { user_id: self.user_id, _id: { $ne: self._id } },
        { $set: { is_default: false } }
      );
  } else {
    // Đảm bảo phải có ít nhất 1 địa chỉ mặc định (trừ khi đây là địa chỉ đầu tiên)
    // Logic phức tạp hơn có thể được xử lý tại tầng Service
  }

  // 2. Logic cho Địa chỉ Thanh toán (is_billing)
  if (self.is_billing) {
    // Đặt tất cả địa chỉ thanh toán khác của user này thành false
    await self
      .model("Address")
      .updateMany(
        { user_id: self.user_id, _id: { $ne: self._id } },
        { $set: { is_billing: false } }
      );
  }

  next();
});

const Address = mongoose.model("Address", addressSchema);

export default Address;
