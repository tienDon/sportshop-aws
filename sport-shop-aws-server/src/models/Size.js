import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    chart_type: {
      type: String,
      required: true,
      enum: [
        "clothing_men",
        "clothing_women",
        "clothing_kids",
        "shoes_men",
        "shoes_women",
        "shoes_kids",
        "accessories",
      ],
    },
    sort_order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// Index tối ưu cho việc lấy danh sách size theo thứ tự cho UI
sizeSchema.index({ chart_type: 1, sort_order: 1 });
// Index đảm bảo tính duy nhất của Size name trong phạm vi 1 Chart Type
sizeSchema.index({ name: 1, chart_type: 1 }, { unique: true });

const Size = mongoose.model("Size", sizeSchema);

export default Size;
