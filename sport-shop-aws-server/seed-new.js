import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./src/models/Category.js";
import Attribute from "./src/models/Attribute.js";
import Brand from "./src/models/Brand.js";
import Color from "./src/models/Color.js";
import Size from "./src/models/Size.js";
import Sport from "./src/models/Sport.js";
import Product from "./src/models/Product.js";

dotenv.config();
import { connectDB } from "./src/libs/db.js";

dotenv.config();
// Kết nối MongoDB

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("🌱 Starting seed process...");

    // Xóa dữ liệu cũ
    await Promise.all([
      Category.deleteMany({}),
      Attribute.deleteMany({}),
      Brand.deleteMany({}),
      Color.deleteMany({}),
      Size.deleteMany({}),
      Sport.deleteMany({}),
      Product.deleteMany({}),
    ]);

    // 1. Tạo Attributes
    const attributes = await Attribute.insertMany([
      {
        name: "Giới tính",
        code: "gender",
        is_filterable: true,
        values: [
          { value: "Nam", sort_order: 1 },
          { value: "Nữ", sort_order: 2 },
          { value: "Trẻ em", sort_order: 3 },
        ],
      },
      {
        name: "Chất liệu",
        code: "material",
        is_filterable: true,
        values: [
          { value: "Cotton", sort_order: 1 },
          { value: "Polyester", sort_order: 2 },
          { value: "Da thật", sort_order: 3 },
          { value: "Da tổng hợp", sort_order: 4 },
          { value: "Mesh", sort_order: 5 },
        ],
      },
      {
        name: "Công nghệ",
        code: "technology",
        is_filterable: false,
        values: [
          { value: "Charged Cotton®", sort_order: 1 },
          { value: "Nike Air", sort_order: 2 },
          { value: "Adidas Boost", sort_order: 3 },
          { value: "Croslite™", sort_order: 4 },
        ],
      },
    ]);

    // 2. Tạo Categories với attribute_config
    const categories = await Category.insertMany([
      {
        name: "Giày thể thao",
        slug: "giay-the-thao",
        is_active: true,
        parent_id: null,
        attribute_config: [
          {
            attr_id: attributes[0]._id, // Giới tính
            is_required: true,
            display_order: 1,
          },
          {
            attr_id: attributes[1]._id, // Chất liệu
            is_required: true,
            display_order: 2,
          },
          {
            attr_id: attributes[2]._id, // Công nghệ
            is_required: false,
            display_order: 3,
          },
        ],
      },
      {
        name: "Quần áo thể thao",
        slug: "quan-ao-the-thao",
        is_active: true,
        parent_id: null,
        attribute_config: [
          {
            attr_id: attributes[0]._id, // Giới tính
            is_required: true,
            display_order: 1,
          },
          {
            attr_id: attributes[1]._id, // Chất liệu
            is_required: true,
            display_order: 2,
          },
        ],
      },
      {
        name: "Phụ kiện",
        slug: "phu-kien",
        is_active: true,
        parent_id: null,
        attribute_config: [
          {
            attr_id: attributes[0]._id, // Giới tính
            is_required: false,
            display_order: 1,
          },
        ],
      },
    ]);

    // 3. Tạo Brands
    const brands = await Brand.insertMany([
      {
        name: "Nike",
        slug: "nike",
        description: "Thương hiệu thể thao hàng đầu thế giới",
        banner: "https://picsum.photos/800/200?random=1",
      },
      {
        name: "Adidas",
        slug: "adidas",
        description: "Thương hiệu thể thao Đức nổi tiếng",
        banner: "https://picsum.photos/800/200?random=2",
      },
      {
        name: "Under Armour",
        slug: "under-armour",
        description: "Thương hiệu thể thao Mỹ",
        banner: "https://picsum.photos/800/200?random=3",
      },
      {
        name: "Crocs",
        slug: "crocs",
        description: "Thương hiệu dép nổi tiếng",
        banner: "https://picsum.photos/800/200?random=4",
      },
    ]);

    // 4. Tạo Colors
    const colors = await Color.insertMany([
      { name: "Đen", hex_code: "#000000" },
      { name: "Trắng", hex_code: "#FFFFFF" },
      { name: "Đỏ", hex_code: "#FF0000" },
      { name: "Xanh dương", hex_code: "#0000FF" },
      { name: "Xanh lá", hex_code: "#00FF00" },
      { name: "Vàng", hex_code: "#FFFF00" },
    ]);

    // 5. Tạo Sizes
    const sizes = await Size.insertMany([
      // Sizes cho giày nam
      { name: "39", chart_type: "shoes_men", sort_order: 1 },
      { name: "40", chart_type: "shoes_men", sort_order: 2 },
      { name: "41", chart_type: "shoes_men", sort_order: 3 },
      { name: "42", chart_type: "shoes_men", sort_order: 4 },
      { name: "43", chart_type: "shoes_men", sort_order: 5 },

      // Sizes cho quần áo nam
      { name: "S", chart_type: "clothing_men", sort_order: 1 },
      { name: "M", chart_type: "clothing_men", sort_order: 2 },
      { name: "L", chart_type: "clothing_men", sort_order: 3 },
      { name: "XL", chart_type: "clothing_men", sort_order: 4 },
      { name: "XXL", chart_type: "clothing_men", sort_order: 5 },
    ]);

    // 6. Tạo Sports
    const sports = await Sport.insertMany([
      {
        name: "Bóng đá",
        slug: "bong-da",
        description: "Môn thể thao vua được yêu thích nhất thế giới",
        icon: "⚽",
        sort_order: 1,
      },
      {
        name: "Chạy bộ",
        slug: "chay-bo",
        description: "Môn thể thao cá nhân phổ biến",
        icon: "🏃",
        sort_order: 2,
      },
      {
        name: "Bóng rổ",
        slug: "bong-ro",
        description: "Môn thể thao đồng đội hấp dẫn",
        icon: "🏀",
        sort_order: 3,
      },
      {
        name: "Tennis",
        slug: "tennis",
        description: "Môn thể thao quý tộc",
        icon: "🎾",
        sort_order: 4,
      },
      {
        name: "Bơi lội",
        slug: "boi-loi",
        description: "Môn thể thao dưới nước",
        icon: "🏊",
        sort_order: 5,
      },
      {
        name: "Gym & Fitness",
        slug: "gym-fitness",
        description: "Rèn luyện sức khỏe và thể hình",
        icon: "🏋️",
        sort_order: 6,
      },
      {
        name: "Yoga",
        slug: "yoga",
        description: "Môn thể thao tâm linh",
        icon: "🧘",
        sort_order: 7,
      },
      {
        name: "Lifestyle",
        slug: "lifestyle",
        description: "Phong cách sống thể thao",
        icon: "✨",
        sort_order: 8,
      },
    ]);

    // 7. Tạo Products mẫu
    const products = await Product.insertMany([
      {
        name: "Nike Air Max 90",
        slug: "nike-air-max-90",
        brand: {
          _id: brands[0]._id,
          name: brands[0].name,
        },
        base_price: 2500000,
        is_active: true,
        description: "Giày thể thao Nike Air Max 90 classic",
        specifications: "Công nghệ Nike Air, đệm khí tối ưu",
        sports: [
          {
            _id: sports[0]._id, // Chạy bộ
            name: sports[0].name,
            slug: sports[0].slug,
          },
          {
            _id: sports[7]._id, // Lifestyle
            name: sports[7].name,
            slug: sports[7].slug,
          },
        ],
        category_ids: [
          {
            _id: categories[0]._id,
            is_primary: true,
          },
        ],
        images: [
          {
            url: "https://picsum.photos/600/600?random=10",
            sort_order: 1,
            is_main: true,
            variant_ids: [],
          },
        ],
        attributes: [
          {
            attr_id: attributes[0]._id,
            value_ids: [attributes[0].values[0]._id], // Nam
            is_custom: false,
          },
          {
            attr_id: attributes[1]._id,
            value_ids: [
              attributes[1].values[2]._id, // Da tổng hợp
              attributes[1].values[4]._id, // Mesh
            ],
            is_custom: false,
          },
          {
            attr_id: attributes[2]._id,
            value_ids: [attributes[2].values[1]._id], // Nike Air
            is_custom: false,
          },
        ],
        variants: [
          {
            color: {
              _id: colors[0]._id,
              name: colors[0].name,
              hex: colors[0].hex_code,
            },
            size: {
              _id: sizes[0]._id,
              name: sizes[0].name,
            },
            price: null, // Dùng base_price
            stock_quantity: 10,
            sku: "NIKE-AM90-BK-39",
          },
          {
            color: {
              _id: colors[1]._id,
              name: colors[1].name,
              hex: colors[1].hex_code,
            },
            size: {
              _id: sizes[1]._id,
              name: sizes[1].name,
            },
            price: null,
            stock_quantity: 5,
            sku: "NIKE-AM90-WH-40",
          },
        ],
      },
      {
        name: "Áo thun Under Armour Project Rock",
        slug: "ao-thun-under-armour-project-rock",
        brand: {
          _id: brands[2]._id,
          name: brands[2].name,
        },
        base_price: 890000,
        is_active: true,
        description: "Áo thun thể thao Under Armour Project Rock",
        specifications: "Chất liệu Charged Cotton, thoáng khí",
        sports: [
          {
            _id: sports[5]._id, // Gym & Fitness
            name: sports[5].name,
            slug: sports[5].slug,
          },
          {
            _id: sports[7]._id, // Lifestyle
            name: sports[7].name,
            slug: sports[7].slug,
          },
        ],
        category_ids: [
          {
            _id: categories[1]._id,
            is_primary: true,
          },
        ],
        images: [
          {
            url: "https://picsum.photos/600/600?random=20",
            sort_order: 1,
            is_main: true,
            variant_ids: [],
          },
        ],
        attributes: [
          {
            attr_id: attributes[0]._id,
            value_ids: [
              attributes[0].values[0]._id, // Nam  
              attributes[0].values[1]._id, // Nữ (Unisex product)
            ],
            is_custom: false,
          },
          {
            attr_id: attributes[1]._id,
            value_ids: [attributes[1].values[0]._id], // Cotton
            is_custom: false,
          },
          {
            attr_id: attributes[2]._id,
            value_ids: [attributes[2].values[0]._id], // Charged Cotton®
            is_custom: false,
          },
          {
            // Ví dụ custom attribute với nhiều giá trị
            custom_name: "Tính năng đặc biệt",
            custom_values: ["Kháng khuẩn", "Thấm hút mồ hôi", "Chống tia UV"],
            is_custom: true,
          },
        ],
        variants: [
          {
            color: {
              _id: colors[0]._id,
              name: colors[0].name,
              hex: colors[0].hex_code,
            },
            size: {
              _id: sizes[5]._id, // S
              name: sizes[5].name,
            },
            price: null,
            stock_quantity: 15,
            sku: "UA-PR-BK-S",
          },
          {
            color: {
              _id: colors[2]._id,
              name: colors[2].name,
              hex: colors[2].hex_code,
            },
            size: {
              _id: sizes[6]._id, // M
              name: sizes[6].name,
            },
            price: null,
            stock_quantity: 20,
            sku: "UA-PR-RD-M",
          },
        ],
      },
    ]);

    console.log("✅ Seed completed successfully!");
    console.log(`📊 Created:`);
    console.log(`   - ${attributes.length} Attributes`);
    console.log(`   - ${categories.length} Categories`);
    console.log(`   - ${brands.length} Brands`);
    console.log(`   - ${colors.length} Colors`);
    console.log(`   - ${sizes.length} Sizes`);
    console.log(`   - ${sports.length} Sports`);
    console.log(`   - ${products.length} Products`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seedDatabase();
