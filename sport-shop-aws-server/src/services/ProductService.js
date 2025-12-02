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

class ProductService {
  static async getAllProducts(queryParams) {
    const {
      gender_slug,
      gender_id,
      category_slug,
      sport_slug,
      brand_slug,
      page = 1,
      limit = 20,
      sort_by,
    } = queryParams;

    const pageInt = parseInt(page);
    const limitInt = parseInt(limit);
    const skip = (pageInt - 1) * limitInt;

    const query = { is_active: true };

    // A. Gender
    if (gender_slug || gender_id) {
      const genderAttr = await Attribute.findOne({ code: "gender" });
      if (genderAttr) {
        let targetValueId = null;
        if (gender_slug && genderAttr.values) {
          const matchedValue = genderAttr.values.find(
            (val) => toSlug(val.value) === gender_slug
          );
          if (matchedValue) targetValueId = matchedValue._id;
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

    // B. Category
    if (category_slug) {
      const category = await Category.findOne({ slug: category_slug })
        .select("_id")
        .lean();

      if (category) {
        // Find all descendant categories
        const ids = [category._id];
        const queue = [category._id];

        while (queue.length > 0) {
          const parentId = queue.shift();
          const children = await Category.find({ parent_id: parentId })
            .select("_id")
            .lean();
          for (const child of children) {
            ids.push(child._id);
            queue.push(child._id);
          }
        }

        query["category_ids._id"] = { $in: ids };
      } else {
        return {
          pagination: {
            page: pageInt,
            limit: limitInt,
            totalPages: 0,
            totalItems: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
          data: [],
        };
      }
    }

    // C. Sport
    if (sport_slug) {
      query["sports.slug"] = sport_slug;
    }

    // D. Brand
    if (brand_slug) {
      const brand = await Brand.findOne({ slug: brand_slug })
        .select("_id")
        .lean();
      if (brand) {
        query["brand._id"] = brand._id;
      } else {
        return {
          pagination: {
            page: pageInt,
            limit: limitInt,
            totalPages: 0,
            totalItems: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
          data: [],
        };
      }
    }

    // Sort
    let sortLogic = { createdAt: -1 };
    if (sort_by === "price_asc") sortLogic = { base_price: 1 };
    if (sort_by === "price_desc") sortLogic = { base_price: -1 };
    if (sort_by === "name_asc") sortLogic = { name: 1 };
    if (sort_by === "name_desc") sortLogic = { name: -1 };

    const [products, totalItems] = await Promise.all([
      Product.find(query)
        .sort(sortLogic)
        .skip(skip)
        .limit(limitInt)
        .lean()
        .exec(),
      Product.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalItems / limitInt);

    return {
      pagination: {
        page: pageInt,
        limit: limitInt,
        totalPages: totalPages,
        totalItems: totalItems,
        hasNextPage: pageInt < totalPages,
        hasPrevPage: pageInt > 1,
      },
      data: products,
    };
  }

  static async getFeaturedProducts(limit = 12) {
    // Fallback: Get latest products since is_featured is not in schema
    const products = await Product.find({ is_active: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    return {
      data: products,
      count: products.length,
    };
  }

  static async getNewArrivals(limit = 12) {
    const products = await Product.find({ is_active: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    return {
      data: products,
      count: products.length,
    };
  }

  static async getBestSellers(limit = 12) {
    // Fallback: Get latest products since sold_count is not in schema
    const products = await Product.find({ is_active: true })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    return {
      data: products,
      count: products.length,
    };
  }

  static async getProductsByCategory(categorySlug, queryParams) {
    const {
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "desc",
      ...filters
    } = queryParams;

    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    // Find all descendant categories
    const ids = [category._id];
    const queue = [category._id];

    while (queue.length > 0) {
      const parentId = queue.shift();
      const children = await Category.find({ parent_id: parentId })
        .select("_id")
        .lean();
      for (const child of children) {
        ids.push(child._id);
        queue.push(child._id);
      }
    }

    const query = {
      "category_ids._id": { $in: ids },
      is_active: true,
    };

    if (filters.brand) query["brand._id"] = filters.brand;
    if (filters.minPrice)
      query.base_price = { $gte: parseFloat(filters.minPrice) };
    if (filters.maxPrice) {
      query.base_price = query.base_price || {};
      query.base_price.$lte = parseFloat(filters.maxPrice);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    sortObj[sort] = order === "desc" ? -1 : 1;

    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const totalProducts = await Product.countDocuments(query);

    return {
      data: products,
      category,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        totalProducts,
      },
    };
  }

  static async getProductsByBrand(brandSlug, queryParams) {
    const {
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "desc",
    } = queryParams;

    const brand = await Brand.findOne({ slug: brandSlug });
    if (!brand) {
      throw new Error("BRAND_NOT_FOUND");
    }

    const query = {
      "brand._id": brand._id,
      is_active: true,
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortObj = {};
    sortObj[sort] = order === "desc" ? -1 : 1;

    const products = await Product.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const totalProducts = await Product.countDocuments(query);

    return {
      data: products,
      brand,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalProducts / parseInt(limit)),
        totalProducts,
      },
    };
  }

  static async getProductBySlug(slug) {
    const product = await Product.findOne({ slug, is_active: true });
    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    // View count is not in schema, skipping update
    // await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

    return product;
  }

  static async searchProducts(queryParams) {
    const { q, ...filters } = queryParams;
    if (!q) throw new Error("MISSING_QUERY");

    const query = {
      name: { $regex: q, $options: "i" },
      is_active: true,
    };

    // Apply other filters if needed (simplified)
    if (filters.minPrice)
      query.base_price = { $gte: parseFloat(filters.minPrice) };
    if (filters.maxPrice) {
      query.base_price = query.base_price || {};
      query.base_price.$lte = parseFloat(filters.maxPrice);
    }

    const products = await Product.find(query).limit(20);
    return {
      data: products,
      query: q,
      count: products.length,
    };
  }

  static async createProduct(data) {
    const product = new Product(data);
    await product.save();
    await product.populate("category brand");
    return product;
  }

  static async updateProduct(id, data) {
    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("category brand");

    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    return product;
  }

  static async deleteProduct(id) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) throw new Error("PRODUCT_NOT_FOUND");
    return true;
  }
}

export default ProductService;
