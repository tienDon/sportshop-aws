import mongoose from "mongoose";

const sportSchema = new mongoose.Schema(
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
      maxlength: 500,
      default: null,
    },
    icon: {
      type: String, // URL icon hoặc class name
      default: null,
    },
    banner: {
      type: String, // URL banner cho sport page
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
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
sportSchema.index({ slug: 1 }, { unique: true });
sportSchema.index({ is_active: 1, sort_order: 1 });

// Static methods
sportSchema.statics.getActiveSports = function () {
  return this.find({ is_active: true }).sort({ sort_order: 1 });
};

const Sport = mongoose.model("Sport", sportSchema);

export default Sport;
