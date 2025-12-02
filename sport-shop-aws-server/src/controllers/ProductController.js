import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";
import Attribute from "../models/Attribute.js";
import mongoose from "mongoose";

// Helper function to slugify string
const toSlug = (str) => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

class ProductController {
  /**
   * Get all products
   * GET /api/products
   */
  static async getAllProducts(req, res) {
    try {
      const {
        gender_slug, // Slug của Giới tính (ví dụ: nam, nu)
        gender_id, // Giữ lại để tương thích ngược
        category_slug, // Slug của Category (ví dụ: ao-thun)
        sport_slug, // Slug của Sport (ví dụ: chay-bo)
        brand_slug, // Slug của Brand (ví dụ: nike)
        page = 1, // Trang hiện tại
        limit = 20, // Số lượng sản phẩm trên mỗi trang
        sort_by,
      } = req.query;

      const pageInt = parseInt(page);
      const limitInt = parseInt(limit);
      const skip = (pageInt - 1) * limitInt; // Số lượng document cần bỏ qua

      // 1. Xây dựng đối tượng truy vấn Mongoose
      const query = { is_active: true };

      // -------------------------
      // A. XỬ LÝ LỌC THEO GENDER (Attribute)
      // -------------------------
      if (gender_slug || gender_id) {
        // Lấy Attribute Gender từ DB
        const genderAttr = await Attribute.findOne({ code: "gender" });

        if (genderAttr) {
          let targetValueId = null;

          if (gender_slug && genderAttr.values) {
            // Tìm value có slug khớp với gender_slug
            const matchedValue = genderAttr.values.find(
              (val) => toSlug(val.value) === gender_slug
            );
            if (matchedValue) {
              targetValueId = matchedValue._id;
            }
          } else if (gender_id) {
            targetValueId = new mongoose.Types.ObjectId(gender_id);
          }

          if (targetValueId) {
            query["attributes"] = {
              $elemMatch: {
                attr_id: genderAttr._id,
                value_ids: targetValueId,
              },
            };
          }
        }
      }

      // -------------------------
      // B. XỬ LÝ LỌC THEO CATEGORY SLUG
      // -------------------------
      if (category_slug) {
        const category = await Category.findOne({ slug: category_slug })
          .select("_id")
          .lean();
        if (category) {
          // Lọc theo ID của Category trong mảng category_ids
          query["category_ids._id"] = category._id;
        } else {
          // Nếu không tìm thấy category, trả về kết quả rỗng (tối ưu hơn là báo lỗi)
          return res.status(200).json({
            success: true,
            pagination: {
              page: pageInt,
              limit: limitInt,
              totalPages: 0,
              totalItems: 0,
            },
            data: [],
          });
        }
      }

      // -------------------------
      // C. XỬ LÝ LỌC THEO SPORT SLUG (Embedded Document)
      // -------------------------
      if (sport_slug) {
        // Mongoose tự động tìm kiếm trong mảng 'sports' có phần tử nào có slug khớp không
        query["sports.slug"] = sport_slug;
      }

      // -------------------------
      // D. XỬ LÝ LỌC THEO BRAND SLUG (Embedded Document)
      // -------------------------
      if (brand_slug) {
        const brand = await Brand.findOne({ slug: brand_slug })
          .select("_id")
          .lean();

        if (brand) {
          // BƯỚC 2: Lọc Product bằng _id của Brand trong đối tượng brand nhúng
          query["brand._id"] = brand._id;
        }
      }

      // Logic sắp xếp
      let sortLogic = { createdAt: -1 }; // Default
      if (sort_by === "price_asc") sortLogic = { base_price: 1 };
      if (sort_by === "price_desc") sortLogic = { base_price: -1 };
      if (sort_by === "name_asc") sortLogic = { name: 1 };
      if (sort_by === "name_desc") sortLogic = { name: -1 };

      // 2. Thực thi 2 truy vấn song song (Tối ưu hóa tốc độ)
      const [products, totalItems] = await Promise.all([
        // Truy vấn 1: Lấy dữ liệu sản phẩm cho trang hiện tại
        Product.find(query)
          .sort(sortLogic) // Thêm logic sắp xếp ở đây (ví dụ: { createdAt: -1 })
          .skip(skip)
          .limit(limitInt)
          .lean() // Tăng tốc độ bằng cách trả về JSON thuần
          .exec(),

        // Truy vấn 2: Đếm tổng số lượng document (cho phân trang)
        Product.countDocuments(query),
      ]);

      // 3. Tính toán Metadata phân trang
      const totalPages = Math.ceil(totalItems / limitInt);

      // 4. Trả về Response
      return res.status(200).json({
        success: true,
        pagination: {
          page: pageInt,
          limit: limitInt,
          totalPages: totalPages,
          totalItems: totalItems,
          hasNextPage: pageInt < totalPages, // Có trang kế tiếp
          hasPrevPage: pageInt > 1, // Có trang trước
        },
        data: products,
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
      const { limit = 12 } = req.query;

      const products = await Product.getFeaturedProducts(parseInt(limit));

      return res.status(200).json({
        success: true,
        data: products,
        count: products.length,
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
      const { limit = 12 } = req.query;

      const products = await Product.getNewArrivals(parseInt(limit));

      return res.status(200).json({
        success: true,
        data: products,
        count: products.length,
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
      const { limit = 12 } = req.query;

      const products = await Product.getBestSellers(parseInt(limit));

      return res.status(200).json({
        success: true,
        data: products,
        count: products.length,
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
      const { categorySlug } = req.params;
      const {
        page = 1,
        limit = 20,
        sort = "createdAt",
        order = "desc",
        ...filters
      } = req.query;

      // Find category by slug
      const category = await Category.findBySlug(categorySlug);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục",
        });
      }

      // Get all subcategories if it's a parent category
      let categoryIds = [category._id];
      if (category.level < 2) {
        const subcategories = await Category.find({
          parentCategory: category._id,
          isActive: true,
        });
        categoryIds = categoryIds.concat(subcategories.map((sub) => sub._id));
      }

      const query = {
        category: { $in: categoryIds },
        isActive: true,
        status: "active",
      };

      // Apply additional filters
      if (filters.brand) query.brand = filters.brand;
      if (filters.minPrice)
        query.originalPrice = { $gte: parseFloat(filters.minPrice) };
      if (filters.maxPrice) {
        query.originalPrice = query.originalPrice || {};
        query.originalPrice.$lte = parseFloat(filters.maxPrice);
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Sort
      const sortObj = {};
      sortObj[sort] = order === "desc" ? -1 : 1;

      const products = await Product.find(query)
        .populate("category", "name slug")
        .populate("brand", "name slug logo")
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit));

      const totalProducts = await Product.countDocuments(query);

      return res.status(200).json({
        success: true,
        data: products,
        category,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProducts / parseInt(limit)),
          totalProducts,
        },
      });
    } catch (error) {
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
      const { brandSlug } = req.params;
      const {
        page = 1,
        limit = 20,
        sort = "createdAt",
        order = "desc",
      } = req.query;

      // Find brand by slug
      const brand = await Brand.findBySlug(brandSlug);
      if (!brand) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy thương hiệu",
        });
      }

      const query = {
        brand: brand._id,
        isActive: true,
        status: "active",
      };

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Sort
      const sortObj = {};
      sortObj[sort] = order === "desc" ? -1 : 1;

      const products = await Product.find(query)
        .populate("category", "name slug")
        .populate("brand", "name slug logo")
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit));

      const totalProducts = await Product.countDocuments(query);

      return res.status(200).json({
        success: true,
        data: products,
        brand,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalProducts / parseInt(limit)),
          totalProducts,
        },
      });
    } catch (error) {
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
      const { slug } = req.params;

      const product = await Product.findBySlug(slug);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm",
        });
      }

      // Increase view count
      await Product.findByIdAndUpdate(product._id, {
        $inc: { viewCount: 1 },
      });

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
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
      const { q, ...filters } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Từ khóa tìm kiếm là bắt buộc",
        });
      }

      const products = await Product.searchProducts(q, filters);

      return res.status(200).json({
        success: true,
        data: products,
        query: q,
        count: products.length,
      });
    } catch (error) {
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
      const product = new Product(req.body);
      await product.save();

      // Populate references
      await product.populate("category brand");

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
      const { id } = req.params;

      const product = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      }).populate("category brand");

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Cập nhật sản phẩm thành công",
        data: product,
      });
    } catch (error) {
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
      const { id } = req.params;

      const product = await Product.findByIdAndDelete(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Xóa sản phẩm thành công",
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

export default ProductController;
