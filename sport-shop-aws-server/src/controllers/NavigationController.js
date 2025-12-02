import NavigationService from "../services/NavigationService.js";

/**
 * GET /api/navigation/main
 * Tạo dữ liệu navigation cho navbar chính
 * Trả về structure: Nam, Nữ, Trẻ Em, Phụ Kiện, Thương Hiệu, Thể Thao
 */
export const getMainNavigation = async (req, res) => {
  try {
    const navigation = await NavigationService.getMainNavigation();

    res.status(200).json({
      success: true,
      data: navigation,
    });
  } catch (error) {
    console.error("Error in getMainNavigation:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo navigation",
      error: error.message,
    });
  }
};
