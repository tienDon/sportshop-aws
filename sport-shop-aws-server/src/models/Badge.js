import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  slug: {
    // Dùng để lọc trên URL (ví dụ: /products?badge_slug=hang-moi)
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  display_text: {
    // Văn bản hiển thị trên card (ví dụ: "MỚI", "GIẢM 50%")
    type: String,
    required: true,
  },
  display_color: {
    // Mã màu (hex) cho UI (ví dụ: #FF0000)
    type: String,
    default: "#000000",
  },
});

badgeSchema.index({ slug: 1 });

const Badge = mongoose.model("Badge", badgeSchema);

export default Badge;
