import mongoose from "mongoose";

const colorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    hex_code: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^#([0-9A-F]{3}){1,2}$/i.test(v);
        },
        message: "Invalid hex color code",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
colorSchema.index({ name: 1 }, { unique: true });

const Color = mongoose.model("Color", colorSchema);

export default Color;
