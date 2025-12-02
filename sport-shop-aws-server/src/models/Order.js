import mongoose from "mongoose";

// Định nghĩa sub-schema cho Items để gọn gàng hơn
const orderItemSchema = new mongoose.Schema(
  {
    // Tham chiếu
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    // Snapshot sản phẩm
    product_name: {
      type: String,
      required: true,
    },
    // 🚨 BỔ SUNG: Snapshot chi tiết Variant (Màu/Size/SKU)
    variant_snapshot: {
      sku: { type: String, required: true },
      color_name: { type: String, required: true },
      size_name: { type: String, required: true },
      image_url: { type: String, default: null },
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // Các loại giá snapshot
    base_price_snapshot: {
      type: Number,
      required: true,
    },
    final_price_snapshot: {
      type: Number,
      required: true,
    },

    // Chi tiết giảm giá
    auto_promotion_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promotion",
      default: null,
    },
    item_auto_discount_amount: {
      type: Number,
      default: 0,
    },
    item_coupon_discount_amount: {
      type: Number,
      default: 0,
    },

    // Giá thực trả cuối cùng (Net Revenue)
    item_price_paid: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order_date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "PENDING",
        "CONFIRMED",
        "SHIPPING",
        "DELIVERED",
        "CANCELLED",
        "RETURNED",
      ], // Thêm "RETURNED"
      default: "PENDING",
    },
    payment_method: {
      type: String,
      required: true,
      enum: ["COD", "BANK_TRANSFER", "CREDIT_CARD", "MOMO", "ZALOPAY"],
    },
    coupon_code_applied: {
      type: String,
      default: null,
    },

    // Tài chính (Financials)
    total_gross_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    total_discount_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total_final_amount: {
      // total_gross - total_discount
      type: Number,
      required: true,
      min: 0,
    },

    // 1. Snapshot Địa Chỉ (Mô hình đúng)
    shipping_address: {
      // Cần thêm: is_billing (nếu bạn cần phân biệt địa chỉ giao hàng và hóa đơn)
      recipient_name: { type: String, required: true },
      phone: { type: String, required: true },
      street: { type: String, required: true },
      ward: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, default: "Vietnam" },
    },

    // 2. Order Items (Sử dụng sub-schema)
    items: [orderItemSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes
orderSchema.index({ user_id: 1 });
orderSchema.index({ status: 1, order_date: -1 }); // Index kép tối ưu truy vấn trạng thái và sắp xếp thời gian
orderSchema.index({ order_date: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
