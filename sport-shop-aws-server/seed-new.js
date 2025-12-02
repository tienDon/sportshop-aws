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

    const brands = [
      {
        _id: "656910a7240c4a4f8d752c1a", // Fixed ID for Under Armour
        name: "Under Armour",
        slug: "under-armour",
        is_active: true,
      },
      {
        _id: "656910a7240c4a4f8d752c1b", // Fixed ID for Nike
        name: "Nike",
        slug: "nike",
        is_active: true,
      },
      {
        name: "Adidas",
        slug: "adidas",
        is_active: true,
      },
      {
        name: "Puma",
        slug: "puma",
        is_active: true,
      },
      {
        name: "New Balance",
        slug: "new-balance",
        is_active: true,
      },
      {
        name: "Skechers",
        slug: "skechers",
        is_active: true,
      },
    ];

    const sports = [
      {
        // Dùng ID này để liên kết với Product demo sau này: '656910a7240c4a4f8d752c21'
        name: "Tập luyện",
        slug: "tap-luyen",
        is_active: true,
      },
      {
        // Dùng ID này để liên kết với Product demo sau này: '656910a7240c4a4f8d752c22'
        name: "Chạy bộ",
        slug: "chay-bo",
        is_active: true,
      },
      {
        name: "Bóng đá",
        slug: "bong-da",
        is_active: true,
      },
      {
        name: "Bóng rổ",
        slug: "bong-ro",
        is_active: true,
      },
      {
        name: "Yoga/Studio",
        slug: "yoga-studio",
        is_active: true,
      },
      {
        name: "Đi bộ/Ngoài trời",
        slug: "di-bo-ngoai-troi",
        is_active: true,
      },
    ];

    const colors = [
      {
        name: "Đỏ",
        hex_code: "#FF0000",
      },
      {
        name: "Xanh Navy",
        hex_code: "#000080",
      },
      {
        name: "Đen",
        hex_code: "#000000",
      },
      {
        name: "Trắng",
        hex_code: "#FFFFFF",
      },
      {
        name: "Xám",
        hex_code: "#808080",
      },
      {
        name: "Vàng",
        hex_code: "#FFFF00",
      },
    ];

    const sizes = [
      // --- A. QUẦN ÁO NAM (clothing_men) ---
      {
        name: "XS",
        chart_type: "clothing_men",
        sort_order: 10,
        is_active: true,
      },
      {
        name: "S",
        chart_type: "clothing_men",
        sort_order: 20,
        is_active: true,
      },
      {
        name: "M",
        chart_type: "clothing_men",
        sort_order: 30,
        is_active: true,
      },
      {
        name: "L",
        chart_type: "clothing_men",
        sort_order: 40,
        is_active: true,
      },
      {
        name: "XL",
        chart_type: "clothing_men",
        sort_order: 50,
        is_active: true,
      },
      {
        name: "XXL",
        chart_type: "clothing_men",
        sort_order: 60,
        is_active: true,
      },

      // --- B. QUẦN ÁO NỮ (clothing_women) ---
      {
        name: "XXS",
        chart_type: "clothing_women",
        sort_order: 5,
        is_active: true,
      },
      {
        name: "XS",
        chart_type: "clothing_women",
        sort_order: 10,
        is_active: true,
      },
      {
        name: "S",
        chart_type: "clothing_women",
        sort_order: 20,
        is_active: true,
      },
      {
        name: "M",
        chart_type: "clothing_women",
        sort_order: 30,
        is_active: true,
      },
      {
        name: "L",
        chart_type: "clothing_women",
        sort_order: 40,
        is_active: true,
      },

      // --- C. GIÀY DÉP NAM (shoes_men) ---
      {
        name: "39",
        chart_type: "shoes_men",
        sort_order: 10,
        is_active: true,
      },
      {
        name: "40",
        chart_type: "shoes_men",
        sort_order: 20,
        is_active: true,
      },
      {
        name: "41",
        chart_type: "shoes_men",
        sort_order: 30,
        is_active: true,
      },
      {
        name: "42",
        chart_type: "shoes_men",
        sort_order: 40,
        is_active: true,
      },
      {
        name: "43",
        chart_type: "shoes_men",
        sort_order: 50,
        is_active: true,
      },
      {
        name: "44",
        chart_type: "shoes_men",
        sort_order: 60,
        is_active: true,
      },

      // --- D. GIÀY DÉP NỮ (shoes_women) ---
      {
        name: "35",
        chart_type: "shoes_women",
        sort_order: 10,
        is_active: true,
      },
      {
        name: "36",
        chart_type: "shoes_women",
        sort_order: 20,
        is_active: true,
      },
      {
        name: "37",
        chart_type: "shoes_women",
        sort_order: 30,
        is_active: true,
      },
      {
        name: "38",
        chart_type: "shoes_women",
        sort_order: 40,
        is_active: true,
      },
      {
        name: "39",
        chart_type: "shoes_women",
        sort_order: 50,
        is_active: true,
      },

      // --- E. PHỤ KIỆN (accessories_standard) ---
      // Áp dụng cho Balo, Túi, Nón - chỉ có một size để hiển thị
      {
        name: "One Size",
        chart_type: "accessories",
        sort_order: 10,
        is_active: true,
      },
    ];

    const attributes = [
      // --- 1. ATTRIBUTE: GENDER (Giới tính) ---
      {
        _id: FIXED_IDS.GenderAttrId, // Sử dụng ID ngẫu nhiên đã tạo
        name: "Giới tính",
        code: "gender",
        is_filterable: true,
        values: [
          {
            _id: FIXED_IDS.MaleValueId, // Sử dụng ID ngẫu nhiên đã tạo
            value: "Nam",
            sort_order: 10,
          },
          {
            _id: FIXED_IDS.FemaleValueId,
            value: "Nữ",
            sort_order: 20,
          },
          {
            _id: FIXED_IDS.KidsValueId,
            value: "Trẻ em",
            sort_order: 30,
          },
        ],
      },

      // --- 2. ATTRIBUTE: MATERIAL (Chất liệu) ---
      {
        _id: FIXED_IDS.MaterialAttrId, // Sử dụng ID ngẫu nhiên đã tạo
        name: "Chất liệu",
        code: "material",
        is_filterable: true,
        values: [
          {
            _id: FIXED_IDS.PolyesterValueId, // Sử dụng ID ngẫu nhiên đã tạo
            value: "Polyester",
            sort_order: 10,
          },
          {
            _id: new mongoose.Types.ObjectId(), // Để Mongoose tự tạo ID cho các giá trị còn lại (nếu bạn không cần tham chiếu chúng)
            value: "Cotton",
            sort_order: 20,
          },
          {
            _id: new mongoose.Types.ObjectId(),
            value: "Da (Leather)",
            sort_order: 30,
          },
        ],
      },
    ];

    const categories = [
      // --- ROOT CATEGORIES (CẤP 1) ---
      {
        _id: CATEGORY_IDS.Ao,
        name: "Áo",
        slug: "ao",
        is_active: true,
        parent_id: null,
        attribute_config: [
          {
            attr_id: FIXED_IDS.GenderAttrId,
            is_required: true,
            display_order: 1,
          },
          {
            attr_id: FIXED_IDS.MaterialAttrId,
            is_required: false,
            display_order: 2,
          },
        ],
      },
      {
        _id: CATEGORY_IDS.Quan,
        name: "Quần ",
        slug: "quan",
        is_active: true,
        parent_id: null,
        attribute_config: [
          {
            attr_id: FIXED_IDS.GenderAttrId,
            is_required: true,
            display_order: 1,
          },
          {
            attr_id: FIXED_IDS.MaterialAttrId,
            is_required: false,
            display_order: 2,
          },
        ],
      },
      {
        _id: CATEGORY_IDS.GiayTheThao,
        name: "Giày Thể Thao",
        slug: "giay-the-thao",
        is_active: true,
        parent_id: null,
        attribute_config: [
          {
            attr_id: FIXED_IDS.GenderAttrId,
            is_required: true,
            display_order: 1,
          },
        ],
      },
      {
        _id: CATEGORY_IDS.GiayDepThoiTrang,
        name: "Giày Dép",
        slug: "giay-dep",
        is_active: true,
        parent_id: null,
        attribute_config: [
          {
            attr_id: FIXED_IDS.GenderAttrId,
            is_required: true,
            display_order: 1,
          },
        ],
      },
      {
        _id: CATEGORY_IDS.PhuKien,
        name: "Phụ Kiện",
        slug: "phu-kien",
        is_active: true,
        parent_id: null,
        attribute_config: [
          {
            attr_id: FIXED_IDS.GenderAttrId,
            is_required: false,
            display_order: 1,
          },
        ],
      },

      // --- ÁO SUBCATEGORIES ---
      {
        _id: CATEGORY_IDS.AoThun,
        name: "Áo Thun",
        slug: "ao-thun",
        parent_id: CATEGORY_IDS.Ao,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.AoTapNu,
        name: "Áo Tập Nữ / Áo Bra",
        slug: "ao-tap-nu-ao-bra",
        parent_id: CATEGORY_IDS.Ao,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.AoBaLo,
        name: "Áo Ba Lỗ",
        slug: "ao-ba-lo",
        parent_id: CATEGORY_IDS.Ao,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.AoKhoac,
        name: "Áo Khoác",
        slug: "ao-khoac",
        parent_id: CATEGORY_IDS.Ao,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.AoSoMi,
        name: "Áo Sơ Mi",
        slug: "ao-so-mi",
        parent_id: CATEGORY_IDS.Ao,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.DoBoi,
        name: "Đồ Bơi",
        slug: "do-boi",
        parent_id: CATEGORY_IDS.Ao,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.AoHoodies,
        name: "Áo Hoodies",
        slug: "ao-hoodies",
        parent_id: CATEGORY_IDS.Ao,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.AoBoi,
        name: "Áo Bơi",
        slug: "ao-boi",
        parent_id: CATEGORY_IDS.Ao,
        is_active: true,
        attribute_config: [],
      },
      // Thêm 2 category bị thiếu cho menu Nam (Áo Polo, Áo Đá Bóng)
      {
        _id: CATEGORY_IDS.AoPolo,
        name: "Áo Polo",
        slug: "ao-polo",
        parent_id: CATEGORY_IDS.Ao,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.AoDaBong,
        name: "Áo Đá Bóng",
        slug: "ao-da-bong",
        parent_id: CATEGORY_IDS.Ao,
        is_active: true,
        attribute_config: [],
      },

      // --- QUẦN/VÁY SUBCATEGORIES ---
      {
        _id: CATEGORY_IDS.QuanNgan,
        name: "Quần Ngắn",
        slug: "quan-ngan",
        parent_id: CATEGORY_IDS.Quan,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.QuanBoTheThao,
        name: "Quần Bó Thể Thao",
        slug: "quan-bo-the-thao",
        parent_id: CATEGORY_IDS.Quan,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.QuanDai,
        name: "Quần Dài",
        slug: "quan-dai",
        parent_id: CATEGORY_IDS.Quan,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.QuanBoi,
        name: "Quần Bơi",
        slug: "quan-boi",
        parent_id: CATEGORY_IDS.Quan,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.ChanVay,
        name: "Chân Váy",
        slug: "chan-vay",
        parent_id: CATEGORY_IDS.Quan,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.QuanLot,
        name: "Quần Lót",
        slug: "quan-lot",
        parent_id: CATEGORY_IDS.Quan,
        is_active: true,
        attribute_config: [],
      },

      // --- GIÀY THỂ THAO SUBCATEGORIES ---
      {
        _id: CATEGORY_IDS.GiayChayBo,
        name: "Chạy Bộ",
        slug: "chay-bo",
        parent_id: CATEGORY_IDS.GiayTheThao,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.GiayLuyenTap,
        name: "Luyện Tập",
        slug: "luyen-tap",
        parent_id: CATEGORY_IDS.GiayTheThao,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.GiayTrail,
        name: "Trail",
        slug: "trail",
        parent_id: CATEGORY_IDS.GiayTheThao,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.GiayBongRo,
        name: "Bóng Rổ",
        slug: "bong-ro",
        parent_id: CATEGORY_IDS.GiayTheThao,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.GiayDaBong,
        name: "Đá Bóng",
        slug: "da-bong",
        parent_id: CATEGORY_IDS.GiayTheThao,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.GiayGolf,
        name: "Golf",
        slug: "golf",
        parent_id: CATEGORY_IDS.GiayTheThao,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.GiayTennis,
        name: "Tennis",
        slug: "tennis",
        parent_id: CATEGORY_IDS.GiayTheThao,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.GiayHoatDongNgoaiTroi,
        name: "Hoạt Động Ngoài Trời",
        slug: "hoat-dong-ngoai-troi",
        parent_id: CATEGORY_IDS.GiayTheThao,
        is_active: true,
        attribute_config: [],
      },

      // --- GIÀY DÉP SUBCATEGORIES ---
      {
        _id: CATEGORY_IDS.GiaySneakers,
        name: "Giày Sneakers",
        slug: "giay-sneakers",
        parent_id: CATEGORY_IDS.GiayDepThoiTrang,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.GiayClog,
        name: "Giày Clog",
        slug: "giay-clog",
        parent_id: CATEGORY_IDS.GiayDepThoiTrang,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.GiayTheThaoThoiTrang,
        name: "Giày Thể Thao",
        slug: "giay-the-thao-thoi-trang",
        parent_id: CATEGORY_IDS.GiayDepThoiTrang,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.DepSandals,
        name: "Dép / Sandals",
        slug: "dep-sandals",
        parent_id: CATEGORY_IDS.GiayDepThoiTrang,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.DepQuaiNgang,
        name: "Dép Quai Ngang",
        slug: "dep-quai-ngang",
        parent_id: CATEGORY_IDS.GiayDepThoiTrang,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.DepXoNgon,
        name: "Dép Xỏ Ngón",
        slug: "dep-xo-ngon",
        parent_id: CATEGORY_IDS.GiayDepThoiTrang,
        is_active: true,
        attribute_config: [],
      },

      // --- PHỤ KIỆN SUBCATEGORIES ---
      // Túi & Ba lô
      {
        _id: CATEGORY_IDS.TuiBalo,
        name: "Ba Lô",
        slug: "ba-lo",
        parent_id: CATEGORY_IDS.PhuKien,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.TuiTheThao,
        name: "Túi Thể Thao",
        slug: "tui-the-thao",
        parent_id: CATEGORY_IDS.PhuKien,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.TuiTrong,
        name: "Túi Trống",
        slug: "tui-trong",
        parent_id: CATEGORY_IDS.PhuKien,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.TuiBaoTu,
        name: "Túi Bao Tử",
        slug: "tui-bao-tu",
        parent_id: CATEGORY_IDS.PhuKien,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.TuiDeoCheo,
        name: "Túi Đeo Chéo",
        slug: "tui-deo-cheo",
        parent_id: CATEGORY_IDS.PhuKien,
        is_active: true,
        attribute_config: [],
      },

      // Mũ / Nón & Băng Đô
      {
        _id: CATEGORY_IDS.MuLuoiTrai,
        name: "Mũ Lưỡi Trai",
        slug: "mu-luoi-trai",
        parent_id: CATEGORY_IDS.PhuKien,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.MuThoiTrang,
        name: "Mũ Thời Trang",
        slug: "mu-thoi-trang",
        parent_id: CATEGORY_IDS.PhuKien,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.MuBoi,
        name: "Mũ Bơi",
        slug: "mu-boi",
        parent_id: CATEGORY_IDS.PhuKien,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.MuLuoiTraiNuaDau,
        name: "Mũ Lưỡi Trai Nửa Đầu",
        slug: "mu-luoi-trai-nua-dau",
        parent_id: CATEGORY_IDS.PhuKien,
        is_active: true,
        attribute_config: [],
      },

      // Khác
      {
        _id: CATEGORY_IDS.KinhBoi,
        name: "Kính Bơi",
        slug: "kinh-boi",
        parent_id: CATEGORY_IDS.PhuKien,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.VoTat,
        name: "Vớ / Tất",
        slug: "vo-tat",
        parent_id: CATEGORY_IDS.PhuKien,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.BanhBongTheThao,
        name: "Banh Bóng Thể Thao",
        slug: "banh-bong-the-thao",
        parent_id: CATEGORY_IDS.PhuKien,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.GangTay,
        name: "Găng Tay",
        slug: "gang-tay",
        parent_id: CATEGORY_IDS.PhuKien,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.BinhNuoc,
        name: "Bình Nước",
        slug: "binh-nuoc",
        parent_id: CATEGORY_IDS.PhuKien,
        is_active: true,
        attribute_config: [],
      },
      {
        _id: CATEGORY_IDS.BangDeo,
        name: "Băng Đeo & Dây Tập Luyện",
        slug: "bang-deo-day-tap-luyen",
        parent_id: CATEGORY_IDS.PhuKien,
        is_active: true,
        attribute_config: [],
      },
      // Thêm category Khẩu Trang bị thiếu cho menu Phụ Kiện
      {
        _id: CATEGORY_IDS.KhauTrang,
        name: "Khẩu Trang",
        slug: "khau-trang",
        parent_id: CATEGORY_IDS.PhuKien,
        is_active: true,
        attribute_config: [],
      },
    ];

    const products = [
      {
        _id: PRODUCT_IDS.AoThunUA,
        name: "Áo Thun Tập Luyện UA Tech 2.0 (Nam)",
        slug: "ua-tech-2-0-short-sleeve-t-shirt-nam",
        base_price: 890000,
        is_active: true,
        description:
          "Áo thun tập luyện công nghệ HeatGear, khô nhanh, siêu nhẹ, thích hợp cho cường độ cao.",

        // 1. BRAND (Snapshot)
        brand: {
          _id: Brand_UA_ID,
          name: "Under Armour",
        },

        // 2. SPORTS (Multi-value Snapshot)
        sports: [
          {
            _id: Sport_Training_ID,
            name: "Tập luyện",
            slug: "tap-luyen",
          },
          {
            _id: Sport_Running_ID,
            name: "Chạy bộ",
            slug: "chay-bo",
          },
        ],

        // 3. CATEGORIES (Reference Array)
        category_ids: [
          { _id: CATEGORY_IDS.AoThun, is_primary: true },
          { _id: CATEGORY_IDS.Ao, is_primary: false },
        ],

        // 4. IMAGES
        images: [
          {
            url: "https://picsum.photos/600/600?random=10",
            sort_order: 1,
            is_main: true,
            variant_ids: [],
          },
        ],

        // 5. ATTRIBUTES (Multi-value)
        attributes: [
          {
            attr_id: FIXED_IDS.GenderAttrId,
            value_ids: [FIXED_IDS.MaleValueId],
            is_custom: false,
          },
          {
            attr_id: FIXED_IDS.MaterialAttrId,
            value_ids: [FIXED_IDS.PolyesterValueId],
            is_custom: false,
          },
        ],

        // 6. VARIANTS
        variants: [
          {
            variant_id: VARIANT_IDS.AoThunUA_Red_M,
            color: {
              _id: Color_Red_ID,
              name: "Đỏ",
              hex: "#FF0000",
            },
            size: {
              _id: Size_M_ID,
              name: "M",
            },
            price: null,
            stock_quantity: 15,
            sku: "UA-TECH-RED-M",
          },
          {
            variant_id: VARIANT_IDS.AoThunUA_Blue_L,
            color: {
              _id: Color_Blue_ID,
              name: "Xanh Navy",
              hex: "#000080",
            },
            size: {
              _id: Size_L_ID,
              name: "L",
            },
            price: null,
            stock_quantity: 10,
            sku: "UA-TECH-BLUE-L",
          },
        ],
      },
      {
        _id: PRODUCT_IDS.QuanShortNike,
        name: "Quần Short Nike Dri-FIT (Nam)",
        slug: "nike-dri-fit-shorts-nam",
        base_price: 750000,
        is_active: true,
        description:
          "Quần short thể thao Nike với công nghệ Dri-FIT thoáng mát.",

        brand: {
          _id: Brand_Nike_ID,
          name: "Nike",
        },

        sports: [
          {
            _id: Sport_Training_ID,
            name: "Tập luyện",
            slug: "tap-luyen",
          },
        ],

        category_ids: [
          { _id: CATEGORY_IDS.QuanNgan, is_primary: true },
          { _id: CATEGORY_IDS.Quan, is_primary: false },
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
            attr_id: FIXED_IDS.GenderAttrId,
            value_ids: [FIXED_IDS.MaleValueId],
            is_custom: false,
          },
        ],

        variants: [
          {
            variant_id: VARIANT_IDS.QuanShortNike_Black_M,
            color: {
              _id: Color_Black_ID,
              name: "Đen",
              hex: "#000000",
            },
            size: {
              _id: Size_M_ID,
              name: "M",
            },
            price: null,
            stock_quantity: 20,
            sku: "NIKE-SHORT-BLACK-M",
          },
        ],
      },
    ];

    // Tạo dữ liệu
    console.log("🌱 Tạo brands...");
    const createdBrands = await Brand.insertMany(brands);

    console.log("🌱 Tạo sports...");
    const createdSports = await Sport.insertMany(sports);

    console.log("🌱 Tạo colors...");
    const createdColors = await Color.insertMany(colors);

    console.log("🌱 Tạo sizes...");
    const createdSizes = await Size.insertMany(sizes);

    console.log("🌱 Tạo attributes...");
    const createdAttributes = await Attribute.insertMany(attributes);

    console.log("🌱 Tạo categories...");
    const createdCategories = await Category.insertMany(categories);

    console.log("🌱 Tạo products...");
    const createdProducts = await Product.insertMany(products);

    console.log("✅ Seed completed successfully!");
    console.log(`📊 Created:`);
    console.log(`   - ${createdAttributes.length} Attributes`);
    console.log(`   - ${createdCategories.length} Categories`);
    console.log(`   - ${createdBrands.length} Brands`);
    console.log(`   - ${createdColors.length} Colors`);
    console.log(`   - ${createdSizes.length} Sizes`);
    console.log(`   - ${createdSports.length} Sports`);
    console.log(`   - ${createdProducts.length} Products`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
};

seedDatabase();

export const FIXED_IDS = {
  // Attribute Types
  GenderAttrId: new mongoose.Types.ObjectId(), // ID ngẫu nhiên cho Gender
  MaterialAttrId: new mongoose.Types.ObjectId(), // ID ngẫu nhiên cho Material

  // Attribute Values
  MaleValueId: new mongoose.Types.ObjectId(), // ID ngẫu nhiên cho Nam
  FemaleValueId: new mongoose.Types.ObjectId(),
  KidsValueId: new mongoose.Types.ObjectId(),

  PolyesterValueId: new mongoose.Types.ObjectId(), // ID ngẫu nhiên cho Polyester
  // ... bạn có thể thêm các ID ngẫu nhiên cho các giá trị khác nếu cần
};

export const CATEGORY_IDS = {
  // CẤP 1 (Root Categories)
  Ao: new mongoose.Types.ObjectId(),
  Quan: new mongoose.Types.ObjectId(),
  GiayTheThao: new mongoose.Types.ObjectId(),
  GiayDepThoiTrang: new mongoose.Types.ObjectId(),
  PhuKien: new mongoose.Types.ObjectId(),

  // CẤP 2: Áo
  AoThun: new mongoose.Types.ObjectId(),
  AoPolo: new mongoose.Types.ObjectId(),
  AoKhoac: new mongoose.Types.ObjectId(),
  AoBaLo: new mongoose.Types.ObjectId(),
  AoSoMi: new mongoose.Types.ObjectId(),
  AoDaBong: new mongoose.Types.ObjectId(),
  AoTapNu: new mongoose.Types.ObjectId(),
  AoHoodies: new mongoose.Types.ObjectId(),
  AoBoi: new mongoose.Types.ObjectId(),
  DoBoi: new mongoose.Types.ObjectId(),

  // CẤP 2: Quần/Váy
  QuanNgan: new mongoose.Types.ObjectId(),
  QuanDai: new mongoose.Types.ObjectId(),
  QuanBoi: new mongoose.Types.ObjectId(),
  QuanBoTheThao: new mongoose.Types.ObjectId(),
  QuanLot: new mongoose.Types.ObjectId(),
  ChanVay: new mongoose.Types.ObjectId(),

  // CẤP 2: Giày Thể Thao
  GiayChayBo: new mongoose.Types.ObjectId(),
  GiayLuyenTap: new mongoose.Types.ObjectId(),
  GiayBongRo: new mongoose.Types.ObjectId(),
  GiayTennis: new mongoose.Types.ObjectId(),
  GiayDaBong: new mongoose.Types.ObjectId(),
  GiayTrail: new mongoose.Types.ObjectId(),
  GiayHoatDongNgoaiTroi: new mongoose.Types.ObjectId(),
  GiayGolf: new mongoose.Types.ObjectId(),

  // CẤP 2: Giày Dép Thời Trang
  GiaySneakers: new mongoose.Types.ObjectId(),
  GiayClog: new mongoose.Types.ObjectId(),
  GiayTheThaoThoiTrang: new mongoose.Types.ObjectId(),
  DepQuaiNgang: new mongoose.Types.ObjectId(),
  DepXoNgon: new mongoose.Types.ObjectId(),
  DepSandals: new mongoose.Types.ObjectId(),

  // CẤP 2: Phụ Kiện
  TuiBalo: new mongoose.Types.ObjectId(),
  TuiTheThao: new mongoose.Types.ObjectId(),
  TuiTrong: new mongoose.Types.ObjectId(),
  TuiBaoTu: new mongoose.Types.ObjectId(),
  TuiDeoCheo: new mongoose.Types.ObjectId(),

  // Mũ/Nón & Băng Đô
  MuLuoiTrai: new mongoose.Types.ObjectId(),
  MuThoiTrang: new mongoose.Types.ObjectId(),
  MuBoi: new mongoose.Types.ObjectId(),
  MuLuoiTraiNuaDau: new mongoose.Types.ObjectId(),

  // Khác
  KinhBoi: new mongoose.Types.ObjectId(),
  VoTat: new mongoose.Types.ObjectId(),
  BanhBongTheThao: new mongoose.Types.ObjectId(),
  GangTay: new mongoose.Types.ObjectId(),
  BinhNuoc: new mongoose.Types.ObjectId(),
  BangDeo: new mongoose.Types.ObjectId(),
  KhauTrang: new mongoose.Types.ObjectId(),
};

// ID cho Product và Variants cố định
export const PRODUCT_IDS = {
  AoThunUA: new mongoose.Types.ObjectId("656910a7240c4a4f8d752c30"),
  QuanShortNike: new mongoose.Types.ObjectId("656910a7240c4a4f8d752c31"),
};

export const VARIANT_IDS = {
  AoThunUA_Red_M: new mongoose.Types.ObjectId("656910a7240c4a4f8d752c40"),
  AoThunUA_Blue_L: new mongoose.Types.ObjectId("656910a7240c4a4f8d752c41"),
  QuanShortNike_Black_M: new mongoose.Types.ObjectId(
    "656910a7240c4a4f8d752c42"
  ),
};

// Giả định các ID khác từ các file mẫu trước đó:
const Brand_UA_ID = new mongoose.Types.ObjectId("656910a7240c4a4f8d752c1a"); // Under Armour ID
const Brand_Nike_ID = new mongoose.Types.ObjectId("656910a7240c4a4f8d752c1b"); // Nike ID
const Color_Red_ID = new mongoose.Types.ObjectId("656910a7240c4a4f8d752c1c"); // Màu Đỏ ID
const Color_Blue_ID = new mongoose.Types.ObjectId("656910a7240c4a4f8d752c1d"); // Màu Xanh Navy ID
const Color_Black_ID = new mongoose.Types.ObjectId("656910a7240c4a4f8d752c1e"); // Màu Đen ID
const Size_M_ID = new mongoose.Types.ObjectId("656910a7240c4a4f8d752c1f"); // Size M ID (clothing_men)
const Size_L_ID = new mongoose.Types.ObjectId("656910a7240c4a4f8d752c20"); // Size L ID (clothing_men)
const Sport_Training_ID = new mongoose.Types.ObjectId(
  "656910a7240c4a4f8d752c21"
); // Tập Luyện ID
const Sport_Running_ID = new mongoose.Types.ObjectId(
  "656910a7240c4a4f8d752c22"
); // Chạy Bộ ID
