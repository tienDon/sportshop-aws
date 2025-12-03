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

  /**
   * Get product by slug
   * GET /api/products/slug/:slug
   */
  static async getProductBySlug(req, res) {
    try {
      const { slug } = req.params;
      const product = await ProductService.getProductBySlug(slug);
      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Lỗi lấy chi tiết sản phẩm:", error);
      if (error.message === "PRODUCT_NOT_FOUND") {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy sản phẩm." });
      }
      return res
        .status(500)
        .json({ success: false, message: "Lỗi Server nội bộ." });
    }
  }
}

export default ProductController;
