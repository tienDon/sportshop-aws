import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    discount_type: {
      type: String,
      required: true,
      enum: ["PERCENT", "FIXED"],
    },
    discount_value: {
      type: Number,
      required: true,
      min: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
    },
    // Targets (Embed mảng này vào)
    targets: [
      {
        type: {
          type: String,
          required: true,
          enum: ["PRODUCT", "CATEGORY", "BRAND"],
        },
        target_id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
promotionSchema.index({ start_date: 1, end_date: 1 });
promotionSchema.index({ is_active: 1 });
promotionSchema.index({ priority: -1 });

const Promotion = mongoose.model("Promotion", promotionSchema);

export default Promotion;
