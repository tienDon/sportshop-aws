import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    parent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
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
    is_active: {
      type: Boolean,
      default: true,
    },
    // Ràng buộc Attribute nằm ngay tại đây (Thay cho bảng Category_Attribute_Relations)
    attribute_config: [
      {
        attr_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Attribute",
          required: true,
        },
        is_required: {
          type: Boolean,
          default: false,
        },
        display_order: {
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
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parent_id: 1 });
categorySchema.index({ is_active: 1 });

// Static methods
categorySchema.statics.getMainCategories = function () {
  return this.find({ parent_id: null, is_active: true }).sort({ name: 1 }); // Thêm sắp xếp
};

categorySchema.statics.getCategoryTree = function () {
  return this.aggregate([
    { $match: { parent_id: null, is_active: true } },
    // Bắt đầu từ Root Nodes
    {
      $graphLookup: {
        from: "categories",
        startWith: "$_id",
        connectFromField: "_id",
        connectToField: "parent_id",
        as: "children",
        maxDepth: 10,
        // Giới hạn độ sâu (hoặc bỏ qua)
        restrictSearchWithMatch: { is_active: true },
      },
    },
  ]);
};

const Category = mongoose.model("Category", categorySchema);

export default Category;
