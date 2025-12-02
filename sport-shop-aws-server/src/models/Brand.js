import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
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
    banner: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
brandSchema.index({ slug: 1 }, { unique: true });

const Brand = mongoose.model("Brand", brandSchema);

export default Brand;
