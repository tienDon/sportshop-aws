import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
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
      maxlength: 1000,
      default: null,
    },

    // Hình ảnh
    logo: {
      type: String,
      default: null, // Logo brand
    },

    banner: {
      type: String,
      default: null, // Banner cho brand page
    },

    // Thông tin liên hệ
    website: {
      type: String,
      default: null,
    },

    country: {
      type: String,
      maxlength: 100,
      default: null,
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

    isFeatured: {
      type: Boolean,
      default: false, // Featured brands
    },

    isPremium: {
      type: Boolean,
      default: false, // Premium brands
    },

    // Ordering
    sortOrder: {
      type: Number,
      default: 0,
    },

    // Statistics
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
brandSchema.index({ slug: 1 }, { unique: true });
brandSchema.index({ isActive: 1, isFeatured: 1 });
brandSchema.index({ sortOrder: 1 });

// Static methods
brandSchema.statics.getFeaturedBrands = function () {
  return this.find({
    isActive: true,
    isFeatured: true,
  }).sort({ sortOrder: 1 });
};

brandSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isActive: true });
};

// Pre-save middleware
brandSchema.pre("save", function (next) {
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

const Brand = mongoose.model("Brand", brandSchema);

export default Brand;
