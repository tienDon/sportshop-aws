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
}

export default BrandController;
