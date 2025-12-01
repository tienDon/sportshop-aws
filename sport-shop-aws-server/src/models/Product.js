import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Thông tin cơ bản
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      maxlength: 2000,
      default: null,
    },

    shortDescription: {
      type: String,
      maxlength: 500,
      default: null,
    },

    // SKU và mã sản phẩm
    sku: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    barcode: {
      type: String,
      default: null,
    },

    // Phân loại
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    // Hình ảnh
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        alt: {
          type: String,
          default: "",
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
        sortOrder: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Giá cả
    originalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    salePrice: {
      type: Number,
      default: null,
      min: 0,
    },

    // Kho
    inventory: {
      inStock: {
        type: Boolean,
        default: true,
      },
      quantity: {
        type: Number,
        default: 0,
        min: 0,
      },
      lowStockThreshold: {
        type: Number,
        default: 10,
      },
    },

    // Thuộc tính sản phẩm
    attributes: {
      color: {
        type: [String],
        default: [],
      },
      size: {
        type: [String],
        default: [],
      },
      gender: {
        type: String,
        enum: ["men", "women", "unisex", "kids"],
        default: "unisex",
      },
      sport: {
        type: [String],
        default: [], // football, basketball, running, etc.
      },
      material: {
        type: [String],
        default: [],
      },
      features: {
        type: [String],
        default: [], // waterproof, breathable, etc.
      },
    },

    // Variations (nếu sản phẩm có nhiều biến thể)
    variations: [
      {
        color: String,
        size: String,
        sku: String,
        price: Number,
        quantity: Number,
        image: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // SEO
    metaTitle: {
      type: String,
      maxlength: 100,
      default: null,
    },

    metaDescription: {
      type: String,
      maxlength: 200,
      default: null,
    },

    keywords: {
      type: [String],
      default: [],
    },

    // Status
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "discontinued"],
      default: "active",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
    },

    // Rating & Reviews
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },

    // Statistics
    viewCount: {
      type: Number,
      default: 0,
    },

    soldCount: {
      type: Number,
      default: 0,
    },

    // Ordering
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ sku: 1 }, { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ status: 1, isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isNewArrival: 1 });
productSchema.index({ isBestSeller: 1 });
productSchema.index({ "attributes.gender": 1 });
productSchema.index({ "attributes.sport": 1 });
productSchema.index({ originalPrice: 1 });
productSchema.index({ "rating.average": 1 });
productSchema.index({ sortOrder: 1 });

// Text search index
productSchema.index({
  name: "text",
  description: "text",
  shortDescription: "text",
  keywords: "text",
});

// Virtuals
productSchema.virtual("currentPrice").get(function () {
  return this.salePrice || this.originalPrice;
});

productSchema.virtual("discountPercentage").get(function () {
  if (this.salePrice && this.salePrice < this.originalPrice) {
    return Math.round(
      ((this.originalPrice - this.salePrice) / this.originalPrice) * 100
    );
  }
  return 0;
});

productSchema.virtual("primaryImage").get(function () {
  const primary = this.images.find((img) => img.isPrimary);
  return primary || this.images[0] || null;
});

// Static methods
productSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isActive: true }).populate(
    "category subcategory brand"
  );
};

productSchema.statics.getFeaturedProducts = function (limit = 10) {
  return this.find({
    isActive: true,
    isFeatured: true,
    status: "active",
  })
    .populate("category brand")
    .sort({ sortOrder: 1 })
    .limit(limit);
};

productSchema.statics.getNewArrivals = function (limit = 10) {
  return this.find({
    isActive: true,
    isNewArrival: true,
    status: "active",
  })
    .populate("category brand")
    .sort({ createdAt: -1 })
    .limit(limit);
};

productSchema.statics.getBestSellers = function (limit = 10) {
  return this.find({
    isActive: true,
    isBestSeller: true,
    status: "active",
  })
    .populate("category brand")
    .sort({ soldCount: -1 })
    .limit(limit);
};

productSchema.statics.searchProducts = function (query, filters = {}) {
  const searchQuery = {
    isActive: true,
    status: "active",
  };

  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Category filter
  if (filters.category) {
    searchQuery.category = filters.category;
  }

  // Brand filter
  if (filters.brand) {
    searchQuery.brand = filters.brand;
  }

  // Price range filter
  if (filters.minPrice || filters.maxPrice) {
    searchQuery.originalPrice = {};
    if (filters.minPrice) searchQuery.originalPrice.$gte = filters.minPrice;
    if (filters.maxPrice) searchQuery.originalPrice.$lte = filters.maxPrice;
  }

  // Gender filter
  if (filters.gender) {
    searchQuery["attributes.gender"] = filters.gender;
  }

  // Sport filter
  if (filters.sport) {
    searchQuery["attributes.sport"] = { $in: [filters.sport] };
  }

  return this.find(searchQuery).populate("category brand");
};

// Pre-save middleware
productSchema.pre("save", function (next) {
  // Auto generate slug if not provided
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  }

  // Auto generate SKU if not provided
  if (this.isNew && !this.sku) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.sku = `SPT${timestamp}${random}`;
  }

  // Auto generate meta fields if not provided
  if (!this.metaTitle) {
    this.metaTitle = this.name;
  }

  if (!this.metaDescription) {
    this.metaDescription =
      this.shortDescription ||
      this.description?.substring(0, 160) ||
      `${this.name} - Sản phẩm chất lượng cao`;
  }

  // Ensure primary image
  if (this.images.length > 0) {
    const hasPrimary = this.images.some((img) => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }

  next();
});

// Ensure virtual fields are serialized
productSchema.set("toJSON", {
  virtuals: true,
});

const Product = mongoose.model("Product", productSchema);

export default Product;
