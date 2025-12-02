import mongoose from "mongoose";

const attributeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    code: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    is_filterable: {
      type: Boolean,
      default: false,
    },
    // Embed values
    values: [
      {
        // 🚨 BỔ SUNG: Định nghĩa tường minh ObjectId cho mỗi Value
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(), // Tạo ID mới
        },
        value: {
          type: String,
          required: true,
          trim: true,
        },
        sort_order: {
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
attributeSchema.index({ code: 1 }, { unique: true });
attributeSchema.index({ is_filterable: 1 });

const Attribute = mongoose.model("Attribute", attributeSchema);

export default Attribute;
