import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // 1. BRAND: Sửa lỗi tham chiếu và yêu cầu
    brand: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true, // ID bắt buộc phải có
      },
      name: {
        type: String,
        required: true,
      },
    },
    base_price: {
      type: Number,
      required: true,
      min: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: null,
    },
    specifications: {
      type: String, // HTML hoặc Text
      default: null,
    },
    note: {
      type: String,
      default: null,
    },

    // 2. SPORT: Chuyển thành Array (Multi-value)
    sports: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        slug: {
          type: String,
          required: true,
        },
      },
    ],

    // 3. Categories (Mô hình đúng)
    category_ids: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
          required: true,
        },
        is_primary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // 4. Images (Mô hình đúng)
    images: [
      {
        image_id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
        url: {
          type: String,
          required: true,
        },
        sort_order: {
          type: Number,
          default: 0,
        },
        is_main: {
          type: Boolean,
          default: false,
        },
        variant_ids: [
          // Cho phép 1 ảnh áp dụng cho nhiều variant
          {
            type: mongoose.Schema.Types.ObjectId,
          },
        ],
      },
    ],

    // 5. Attributes (EAV + Custom Field)
    attributes: [
      {
        attr_id: {
          // Tham chiếu đến Attribute Type (Ví dụ: Gender, Chất liệu)
          type: mongoose.Schema.Types.ObjectId,
          // Loại bỏ ref vì không dùng populate EAV
        },
        // Array của các Value ID (hỗ trợ Multi-value: Gender=[Nam, Nữ])
        value_ids: [
          {
            type: mongoose.Schema.Types.ObjectId,
          },
        ],

        // Nếu là custom (nhập tay)
        custom_name: {
          type: String,
        },
        // Nếu là custom (nhập tay) - Giữ Array để hỗ trợ nhiều giá trị nhập tay
        custom_values: [
          {
            type: String,
          },
        ],
        is_custom: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // 6. Variants (Mô hình đúng)
    variants: [
      {
        variant_id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
        color: {
          _id: { type: mongoose.Schema.Types.ObjectId, required: true },
          name: { type: String, required: true },
          hex: { type: String, required: true },
        },
        size: {
          _id: { type: mongoose.Schema.Types.ObjectId, required: true },
          name: { type: String, required: true },
        },
        price: {
          type: Number,
          default: null,
        },
        stock_quantity: {
          type: Number,
          default: 0,
          min: 0,
        },
        sku: {
          type: String,
          default: null,
        },
      },
    ],

    // THÊM: 7. Badge (Sử dụng Reference)
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge", // Tham chiếu đến Model Badge mới
      default: null, // Có thể không có badge
    },
  },
  {
    timestamps: true,
  }
);

// Indexes (Đã sửa sport và bỏ ref)
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ "brand._id": 1 });
productSchema.index({ "sports._id": 1 }); // Index cho mảng sports
productSchema.index({ is_active: 1 });
productSchema.index({ "category_ids._id": 1 });
productSchema.index({ base_price: 1 });
productSchema.index({ badge: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;
