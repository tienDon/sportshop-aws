import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    // Thông tin cơ bản
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      maxlength: 500,
      default: null,
    },

    // Hình ảnh
    image: {
      type: String,
      default: null, // URL từ placehold.co
    },

    banner: {
      type: String,
      default: null, // Banner cho category page
    },

    // Hierarchy - cấu trúc phân cấp
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    level: {
      type: Number,
      default: 0, // 0: main, 1: sub, 2: sub-sub
      min: 0,
      max: 2,
    },

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

    // Display & Status
    isActive: {
      type: Boolean,
      default: true,
    },

    isNavigation: {
      type: Boolean,
      default: true, // Hiển thị trong navigation menu
    },

    isFeatured: {
      type: Boolean,
      default: false, // Featured categories
    },

    // Ordering
    sortOrder: {
      type: Number,
      default: 0,
    },

    // Statistics (denormalized for performance)
    productCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parentCategory: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ isActive: 1, isNavigation: 1 });
categorySchema.index({ sortOrder: 1 });

// Virtual for subcategories
categorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentCategory",
});

// Static methods
categorySchema.statics.getMainCategories = function () {
  return this.find({
    level: 0,
    isActive: true,
    isNavigation: true,
  }).sort({ sortOrder: 1 });
};

categorySchema.statics.getCategoryTree = function () {
  return this.aggregate([
    {
      $match: {
        isActive: true,
        isNavigation: true,
      },
    },
    {
      $sort: { level: 1, sortOrder: 1 },
    },
    {
      $group: {
        _id: "$level",
        categories: { $push: "$$ROOT" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
};

categorySchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isActive: true });
};

// Instance methods
categorySchema.methods.getFullPath = async function () {
  const path = [this.slug];
  let current = this;

  while (current.parentCategory) {
    current = await this.constructor.findById(current.parentCategory);
    if (current) {
      path.unshift(current.slug);
    }
  }

  return path.join("/");
};

// Pre-save middleware
categorySchema.pre("save", function (next) {
  // Auto generate slug if not provided
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .trim();
  }

  // Auto generate meta fields if not provided
  if (!this.metaTitle) {
    this.metaTitle = this.name;
  }

  if (!this.metaDescription) {
    this.metaDescription = this.description || `Sản phẩm ${this.name}`;
  }

  next();
});

// Ensure virtual fields are serialized
categorySchema.set("toJSON", {
  virtuals: true,
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
