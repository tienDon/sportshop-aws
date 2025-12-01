import Product from "../models/Product.js";
import Category from "../models/Category.js";
import Brand from "../models/Brand.js";

class ProductController {
  /**
   * Get all products
   * GET /api/products
   */
  static async getAllProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        brand,
        minPrice,
        maxPrice,
        gender,
        sport,
        featured,
        newArrival,
        bestSeller,
        sort = "createdAt",
        order = "desc",
        search,
      } = req.query;

      const query = {
        isActive: true,
        status: "active",
      };

      // Filters
      // Handle category filtering with simplified logic
      if (category) {
        console.log(`Processing category: "${category}"`);

        // Main gender categories - filter by gender
        if (category === "nam") {
          query["attributes.gender"] = "men";
          console.log("Applied gender filter: men");
        } else if (category === "nu") {
          query["attributes.gender"] = "women";
          console.log("Applied gender filter: women");
        } else if (category === "tre-em") {
          query["attributes.gender"] = "kids";
          console.log("Applied gender filter: kids");
        }
        // Special categories - filter by product flags
        else if (category === "hang-moi") {
          query.isNewArrival = true;
          console.log("Applied new arrival filter");
        } else if (category === "uu-dai") {
          query.salePrice = { $exists: true, $ne: null };
          console.log("Applied sale filter");
        } else if (category === "featured") {
          query.isFeatured = true;
          console.log("Applied featured filter");
        }
        // Traditional category lookup (for subcategories later)
        else {
          // Check if category is a valid ObjectId, if not, treat as slug
          if (category.match(/^[0-9a-fA-F]{24}$/)) {
            query.category = category;
          } else {
            // Find category by slug
            const categoryDoc = await Category.findOne({ slug: category });
            console.log(`Looking for category with slug: "${category}"`);
            console.log(`Found category:`, categoryDoc);

            if (categoryDoc) {
              // Get all subcategories recursively
              const allCategoryIds = [categoryDoc._id];

              // Find direct subcategories
              const subcategories = await Category.find({
                parentCategory: categoryDoc._id,
              });
              subcategories.forEach((sub) => allCategoryIds.push(sub._id));

              // Find sub-subcategories
              for (const sub of subcategories) {
                const subSubs = await Category.find({
                  parentCategory: sub._id,
                });
                subSubs.forEach((subSub) => allCategoryIds.push(subSub._id));
              }

              console.log(`All category IDs to search:`, allCategoryIds);

              // Search in all categories (main + subcategories)
              query.category = { $in: allCategoryIds };
            } else {
              // If category not found, return empty results
              return res.status(200).json({
                success: true,
                data: [],
                message: `Category "${category}" not found`,
                pagination: {
                  page: parseInt(page),
                  limit: parseInt(limit),
                  total: 0,
                  totalPages: 0,
                },
              });
            }
          }
        }
      }

      if (brand) {
        // Check if brand is a valid ObjectId, if not, treat as slug
        if (brand.match(/^[0-9a-fA-F]{24}$/)) {
          query.brand = brand;
        } else {
          // Find brand by slug
          const brandDoc = await Brand.findOne({ slug: brand });
          if (brandDoc) {
            query.brand = brandDoc._id;
          } else {
            // If brand not found, return empty results
            return res.status(200).json({
              success: true,
              data: [],
              pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: 0,
                totalPages: 0,
              },
            });
          }
        }
      }

      if (minPrice || maxPrice) {
        query.originalPrice = {};
        if (minPrice) query.originalPrice.$gte = parseFloat(minPrice);
        if (maxPrice) query.originalPrice.$lte = parseFloat(maxPrice);
      }

      if (gender) {
        query["attributes.gender"] = gender;
      }

      if (sport) {
        query["attributes.sport"] = { $in: [sport] };
      }

      if (featured === "true") {
        query.isFeatured = true;
      }

      if (newArrival === "true") {
        query.isNewArrival = true;
      }

      if (bestSeller === "true") {
        query.isBestSeller = true;
      }

      // Search
      if (search) {
        query.$text = { $search: search };
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Sort
      const sortObj = {};
      if (sort === "price") {
        sortObj.originalPrice = order === "desc" ? -1 : 1;
      } else if (sort === "name") {
        sortObj.name = order === "desc" ? -1 : 1;
      } else if (sort === "rating") {
        sortObj["rating.average"] = order === "desc" ? -1 : 1;
      } else if (sort === "popularity") {
        sortObj.soldCount = order === "desc" ? -1 : 1;
      } else {
        sortObj[sort] = order === "desc" ? -1 : 1;
      }

      const products = await Product.find(query)
        .populate("category", "name slug")
        .populate("brand", "name slug logo")
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit));

      console.log("Final query:", JSON.stringify(query, null, 2));
      console.log("Found products count:", products.length);
      if (products.length > 0) {
        console.log("Sample product:", JSON.stringify(products[0], null, 2));
      }

      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / parseInt(limit));

      return res.status(200).json({
        success: true,
        data: products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi lấy danh sách sản phẩm",
        error: error.message,
      });
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
