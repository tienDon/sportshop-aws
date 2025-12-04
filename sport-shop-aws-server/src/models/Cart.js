import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    // Tham chiếu
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    // 🚨 Bổ sung: Snapshots cho hiển thị UI
    product_name_snapshot: {
      // Tên sản phẩm
      type: String,
      required: true,
    },
    variant_snapshot: {
      // Tên màu, size, SKU để hiển thị
      sku: { type: String, default: null },
      color_name: { type: String, required: true },
      size_name: { type: String, required: true },
      image_url: { type: String, required: true }, // Ảnh đại diện
      brand_name: { type: String, required: true }, // <--- Thêm cái này để đỡ query
    },

    // Snapshots giá & Khuyến mãi
    // Vẫn giữ để đối chiếu lịch sử hoặc tính toán lúc thanh toán
    base_price_snapshot: {
      type: Number,
      required: true,
    },
    final_price_snapshot: {
      type: Number,
      required: true,
    },
    auto_promotion_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Promotion",
      default: null,
    },
    // Thêm trường để lưu chi tiết khuyến mãi đã áp dụng (nếu cần)
    promotion_discount_snapshot: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
); // Không cần ID riêng cho Cart Item

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    session_id: {
      type: String,
      default: null,
    },
    coupon_code: {
      type: String,
      default: null,
    },
    items: [cartItemSchema], // Sử dụng Schema con đã định nghĩa
  },
  {
    timestamps: true,
  }
);

// Indexes
// 🚨 Cải tiến: Compound Index để tìm giỏ hàng nhanh và đảm bảo tính duy nhất
cartSchema.index(
  { user_id: 1 },
  { unique: true, partialFilterExpression: { user_id: { $ne: null } } }
); // Chỉ có 1 giỏ hàng cho mỗi User (bỏ qua null)

cartSchema.index(
  { session_id: 1 },
  { unique: true, partialFilterExpression: { session_id: { $ne: null } } }
); // Chỉ có 1 giỏ hàng cho mỗi Session

cartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 * 30 }); // TTL Index (Tự động xóa giỏ hàng cũ sau 30 ngày)

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
