import Category from "../models/Category.js";

class CategoryController {
  /**
   * Get all main categories for navigation
   * GET /api/categories/navigation
   */
  static async getNavigationCategories(req, res) {
    try {
      const categories = await Category.find({
        level: 0,
        isActive: true,
        isNavigation: true,
      })
        .populate({
          path: "subcategories",
          match: { isActive: true, isNavigation: true },
          options: { sort: { sortOrder: 1 } },
          populate: {
            path: "subcategories",
            match: { isActive: true, isNavigation: true },
            options: { sort: { sortOrder: 1 } },
          },
        })
        .sort({ sortOrder: 1 });

      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi lấy danh mục navigation",
        error: error.message,
      });
    }
  }

  /**
   * Get category tree (hierarchical structure)
   * GET /api/categories/tree
   */
  static async getCategoryTree(req, res) {
    try {
      const tree = await Category.getCategoryTree();

      return res.status(200).json({
        success: true,
        data: tree,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi lấy cây danh mục",
        error: error.message,
      });
    }
  }

  /**
   * Get all categories
   * GET /api/categories
   */
  static async getAllCategories(req, res) {
    try {
      const { level, parent, featured, active = true } = req.query;

      const query = {};

      if (active !== undefined) {
        query.isActive = active === "true";
      }

      if (level !== undefined) {
        query.level = parseInt(level);
      }

      if (parent) {
        query.parentCategory = parent;
      }

      if (featured !== undefined) {
        query.isFeatured = featured === "true";
      }

      const categories = await Category.find(query)
        .populate("parentCategory", "name slug")
        .sort({ level: 1, sortOrder: 1 });

      return res.status(200).json({
        success: true,
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi lấy danh sách danh mục",
        error: error.message,
      });
    }
  }

  /**
   * Get category by slug
   * GET /api/categories/slug/:slug
   */
  static async getCategoryBySlug(req, res) {
    try {
      const { slug } = req.params;

      const category = await Category.findBySlug(slug)
        .populate("parentCategory", "name slug")
        .populate({
          path: "subcategories",
          match: { isActive: true },
          options: { sort: { sortOrder: 1 } },
        });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục",
        });
      }

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi lấy thông tin danh mục",
        error: error.message,
      });
    }
  }

  /**
   * Get category by ID
   * GET /api/categories/:id
   */
  static async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findById(id)
        .populate("parentCategory", "name slug")
        .populate({
          path: "subcategories",
          match: { isActive: true },
          options: { sort: { sortOrder: 1 } },
        });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục",
        });
      }

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi lấy thông tin danh mục",
        error: error.message,
      });
    }
  }

  /**
   * Create new category
   * POST /api/categories
   */
  static async createCategory(req, res) {
    try {
      const categoryData = req.body;

      // Validate parent category if provided
      if (categoryData.parentCategory) {
        const parent = await Category.findById(categoryData.parentCategory);
        if (!parent) {
          return res.status(400).json({
            success: false,
            message: "Danh mục cha không tồn tại",
          });
        }

        // Set level based on parent
        categoryData.level = parent.level + 1;

        // Validate max level
        if (categoryData.level > 2) {
          return res.status(400).json({
            success: false,
            message: "Chỉ hỗ trợ tối đa 3 cấp danh mục",
          });
        }
      }

      const category = new Category(categoryData);
      await category.save();

      return res.status(201).json({
        success: true,
        message: "Tạo danh mục thành công",
        data: category,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Slug danh mục đã tồn tại",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Lỗi tạo danh mục",
        error: error.message,
      });
    }
  }

  /**
   * Update category
   * PUT /api/categories/:id
   */
  static async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const category = await Category.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Cập nhật danh mục thành công",
        data: category,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi cập nhật danh mục",
        error: error.message,
      });
    }
  }

  /**
   * Delete category
   * DELETE /api/categories/:id
   */
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      // Check if category has subcategories
      const hasSubcategories = await Category.findOne({
        parentCategory: id,
      });

      if (hasSubcategories) {
        return res.status(400).json({
          success: false,
          message: "Không thể xóa danh mục có danh mục con",
        });
      }

      const category = await Category.findByIdAndDelete(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Xóa danh mục thành công",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi xóa danh mục",
        error: error.message,
      });
    }
  }
}

export default CategoryController;
