import ProductService from "../services/ProductService.js";

class ProductController {
  /**
   * Get all products
   * GET /api/products
   */
  static async getAllProducts(req, res) {
    try {
      const result = await ProductService.getAllProducts(req.query);
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error("Lỗi truy vấn sản phẩm:", error);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi Server nội bộ." });
    }
  }
}

export default ProductController;
