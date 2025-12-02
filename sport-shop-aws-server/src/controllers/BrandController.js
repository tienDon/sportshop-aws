import Brand from "../models/Brand.js";

class BrandController {
  /**
   * Get all brands
   * GET /api/brands
   */
  static async getAllBrands(req, res) {
    try {
      // Lấy tất cả brand đang active, sắp xếp theo tên A-Z
      const brands = await Brand.find({ is_active: true }).sort({ name: 1 });

      return res.status(200).json({
        success: true,
        data: brands,
        count: brands.length,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi lấy danh sách thương hiệu",
        error: error.message,
      });
    }
  }

  /**
   * Get featured brands
   * GET /api/brands/featured
   */
  static async getFeaturedBrands(req, res) {
    try {
      const { limit = 12 } = req.query;

      const brands = await Brand.getFeaturedBrands().limit(parseInt(limit));

      return res.status(200).json({
        success: true,
        data: brands,
        count: brands.length,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi lấy thương hiệu nổi bật",
        error: error.message,
      });
    }
  }

  /**
   * Get brand by slug
   * GET /api/brands/slug/:slug
   */
  static async getBrandBySlug(req, res) {
    try {
      const { slug } = req.params;

      const brand = await Brand.findBySlug(slug);

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thương hiệu",
        });
      }

      return res.status(200).json({
        success: true,
        data: brand,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi lấy thông tin thương hiệu",
        error: error.message,
      });
    }
  }

  /**
   * Get brand by ID
   * GET /api/brands/:id
   */
  static async getBrandById(req, res) {
    try {
      const { id } = req.params;

      const brand = await Brand.findById(id);

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thương hiệu",
        });
      }

      return res.status(200).json({
        success: true,
        data: brand,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi lấy thông tin thương hiệu",
        error: error.message,
      });
    }
  }

  /**
   * Create new brand
   * POST /api/brands
   */
  static async createBrand(req, res) {
    try {
      const brand = new Brand(req.body);
      await brand.save();

      return res.status(201).json({
        success: true,
        message: "Tạo thương hiệu thành công",
        data: brand,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Slug thương hiệu đã tồn tại",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Lỗi tạo thương hiệu",
        error: error.message,
      });
    }
  }

  /**
   * Update brand
   * PUT /api/brands/:id
   */
  static async updateBrand(req, res) {
    try {
      const { id } = req.params;

      const brand = await Brand.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thương hiệu",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Cập nhật thương hiệu thành công",
        data: brand,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi cập nhật thương hiệu",
        error: error.message,
      });
    }
  }

  /**
   * Delete brand
   * DELETE /api/brands/:id
   */
  static async deleteBrand(req, res) {
    try {
      const { id } = req.params;

      const brand = await Brand.findByIdAndDelete(id);

      if (!brand) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thương hiệu",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Xóa thương hiệu thành công",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi xóa thương hiệu",
        error: error.message,
      });
    }
  }
}

export default BrandController;
