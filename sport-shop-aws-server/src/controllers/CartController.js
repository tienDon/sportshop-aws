import CartService from "../services/CartService.js";

class CartController {
  // 1. Get Cart (with Sync Logic)
  static async getCart(req, res) {
    try {
      const userId = req.user.userId;
      const result = await CartService.getCart(userId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get Cart Error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy giỏ hàng",
        error: error.message,
      });
    }
  }

  // 2. Get Cart Count (Lightweight)
  static async getCartCount(req, res) {
    try {
      const userId = req.user.userId;
      const count = await CartService.getCartCount(userId);

      return res.status(200).json({
        success: true,
        count: count,
      });
    } catch (error) {
      return res.status(500).json({ success: false, count: 0 });
    }
  }

  // 3. Add to Cart
  static async addToCart(req, res) {
    try {
      const userId = req.user.userId;
      const { product_id, variant_id, quantity } = req.body;

      if (!product_id || !variant_id || !quantity) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin sản phẩm",
        });
      }

      const cart = await CartService.addToCart(userId, {
        product_id,
        variant_id,
        quantity,
      });

      return res.status(200).json({
        success: true,
        message: "Đã thêm vào giỏ hàng",
        cartCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
      });
    } catch (error) {
      console.error("Add to Cart Error:", error);
      const status =
        error.message.includes("không tồn tại") ||
        error.message.includes("Giỏ hàng trống")
          ? 404
          : 400;
      return res.status(status).json({
        success: false,
        message: error.message || "Lỗi khi thêm vào giỏ hàng",
      });
    }
  }

  // 4. Update Quantity
  static async updateCartItem(req, res) {
    try {
      const userId = req.user.userId;
      const { variant_id, quantity } = req.body;

      const result = await CartService.updateCartItem(
        userId,
        variant_id,
        quantity
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const status =
        error.message.includes("không tồn tại") ||
        error.message.includes("Giỏ hàng trống") ||
        error.message.includes("không có trong giỏ")
          ? 404
          : 400;
      return res.status(status).json({
        success: false,
        message: error.message || "Lỗi cập nhật giỏ hàng",
      });
    }
  }

  // 5. Remove Item
  static async removeCartItem(req, res) {
    try {
      const userId = req.user.userId;
      const { variant_id } = req.params;

      const result = await CartService.removeCartItem(userId, variant_id);

      return res.status(200).json({
        success: true,
        message: "Đã xóa sản phẩm",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi xóa sản phẩm",
        error: error.message,
      });
    }
  }
}

export default CartController;
