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
   * Get featured products
   * GET /api/products/featured
   */
  static async getFeaturedProducts(req, res) {
    try {
      const result = await ProductService.getFeaturedProducts(req.query.limit);
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi lấy sản phẩm nổi bật",
        error: error.message,
      });
    }
  }

  /**
   * Get new arrivals
   * GET /api/products/new-arrivals
   */
  static async getNewArrivals(req, res) {
    try {
      const result = await ProductService.getNewArrivals(req.query.limit);
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi lấy sản phẩm mới",
        error: error.message,
      });
    }
  }

  /**
   * Get best sellers
   * GET /api/products/best-sellers
   */
  static async getBestSellers(req, res) {
    try {
      const result = await ProductService.getBestSellers(req.query.limit);
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi lấy sản phẩm bán chạy",
        error: error.message,
      });
    }
  }

  /**
   * Get products by category
   * GET /api/products/category/:categorySlug
   */
  static async getProductsByCategory(req, res) {
    try {
      const result = await ProductService.getProductsByCategory(
        req.params.categorySlug,
        req.query
      );
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      if (error.message === "CATEGORY_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Lỗi lấy sản phẩm theo danh mục",
        error: error.message,
      });
    }
  }

  /**
   * Get products by brand
   * GET /api/products/brand/:brandSlug
   */
  static async getProductsByBrand(req, res) {
    try {
      const result = await ProductService.getProductsByBrand(
        req.params.brandSlug,
        req.query
      );
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      if (error.message === "BRAND_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thương hiệu",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Lỗi lấy sản phẩm theo thương hiệu",
        error: error.message,
      });
    }
  }

  /**
   * Get product by slug
   * GET /api/products/slug/:slug
   */
  static async getProductBySlug(req, res) {
    try {
      const product = await ProductService.getProductBySlug(req.params.slug);
      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      if (error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Lỗi lấy thông tin sản phẩm",
        error: error.message,
      });
    }
  }

  /**
   * Search products
   * GET /api/products/search
   */
  static async searchProducts(req, res) {
    try {
      const result = await ProductService.searchProducts(req.query);
      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      if (error.message === "MISSING_QUERY") {
        return res.status(400).json({
          success: false,
          message: "Từ khóa tìm kiếm là bắt buộc",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Lỗi tìm kiếm sản phẩm",
        error: error.message,
      });
    }
  }

  /**
   * Create new product
   * POST /api/products
   */
  static async createProduct(req, res) {
    try {
      const product = await ProductService.createProduct(req.body);
      return res.status(201).json({
        success: true,
        message: "Tạo sản phẩm thành công",
        data: product,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "SKU hoặc slug sản phẩm đã tồn tại",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Lỗi tạo sản phẩm",
        error: error.message,
      });
    }
  }

  /**
   * Update product
   * PUT /api/products/:id
   */
  static async updateProduct(req, res) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: "Cập nhật sản phẩm thành công",
        data: product,
      });
    } catch (error) {
      if (error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Lỗi cập nhật sản phẩm",
        error: error.message,
      });
    }
  }

  /**
   * Delete product
   * DELETE /api/products/:id
   */
  static async deleteProduct(req, res) {
    try {
      await ProductService.deleteProduct(req.params.id);
      return res.status(200).json({
        success: true,
        message: "Xóa sản phẩm thành công",
      });
    } catch (error) {
      if (error.message === "PRODUCT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm",
        });
      }
      return res.status(500).json({
        success: false,
        message: "Lỗi xóa sản phẩm",
        error: error.message,
      });
    }
  }
}

export default ProductController;
