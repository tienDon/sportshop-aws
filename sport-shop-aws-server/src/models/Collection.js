import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
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
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    banner_url: {
      type: String,
      default: null,
    },
    // Danh sách sản phẩm trong collection
    product_refs: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        sort_rank: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
collectionSchema.index({ slug: 1 }, { unique: true });
collectionSchema.index({ start_date: 1, end_date: 1 });

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;
