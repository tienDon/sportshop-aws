import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./src/models/Category.js";
import Brand from "./src/models/Brand.js";
import Product from "./src/models/Product.js";
import { connectDB } from "./src/libs/db.js";

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log("🔗 Connected to database for seeding");

    // Clear existing data
    await Category.deleteMany({});
    await Brand.deleteMany({});
    await Product.deleteMany({});
    console.log("🧹 Cleared existing data");

    // Create Categories (phù hợp với frontend navigation)
    const categories = [
      // Main Categories (Level 0) - giống mainCategories trong frontend
      {
        name: "New",
        slug: "hang-moi",
        description: "Sản phẩm mới nhất",
        level: 0,
        image: "https://placehold.co/400x300/FF4444/FFFFFF?text=NEW",
        banner:
          "https://placehold.co/1200x400/FF4444/FFFFFF?text=HANG+MOI+NHAT",
        sortOrder: 1,
        isNavigation: true,
        isFeatured: true,
      },
      {
        name: "Nam",
        slug: "nam",
        description: "Thời trang và thể thao dành cho nam",
        level: 0,
        image: "https://placehold.co/400x300/0066CC/FFFFFF?text=NAM",
        banner:
          "https://placehold.co/1200x400/0066CC/FFFFFF?text=THOI+TRANG+NAM",
        sortOrder: 2,
        isNavigation: true,
        isFeatured: true,
      },
      {
        name: "Nữ",
        slug: "nu",
        description: "Thời trang và thể thao dành cho nữ",
        level: 0,
        image: "https://placehold.co/400x300/FF6B9D/FFFFFF?text=NU",
        banner:
          "https://placehold.co/1200x400/FF6B9D/FFFFFF?text=THOI+TRANG+NU",
        sortOrder: 3,
        isNavigation: true,
        isFeatured: true,
      },
      {
        name: "Trẻ Em",
        slug: "tre-em",
        description: "Thời trang và thể thao dành cho trẻ em",
        level: 0,
        image: "https://placehold.co/400x300/FFA500/FFFFFF?text=TRE+EM",
        banner:
          "https://placehold.co/1200x400/FFA500/FFFFFF?text=THOI+TRANG+TRE+EM",
        sortOrder: 4,
        isNavigation: true,
        isFeatured: true,
      },
      {
        name: "Thương Hiệu",
        slug: "brands", // match với frontend href
        description: "Các thương hiệu nổi tiếng",
        level: 0,
        image: "https://placehold.co/400x300/6B73FF/FFFFFF?text=THUONG+HIEU",
        banner: "https://placehold.co/1200x400/6B73FF/FFFFFF?text=THUONG+HIEU",
        sortOrder: 5,
        isNavigation: true,
        isFeatured: false,
      },
      {
        name: "Bộ Sưu Tập",
        slug: "bo-suu-tap",
        description: "Bộ sưu tập độc quyền",
        level: 0,
        image: "https://placehold.co/400x300/9C27B0/FFFFFF?text=BST",
        banner: "https://placehold.co/1200x400/9C27B0/FFFFFF?text=BO+SUU+TAP",
        sortOrder: 6,
        isNavigation: true,
        isFeatured: false,
      },
      {
        name: "Thể Thao",
        slug: "sports", // match với frontend href
        description: "Dụng cụ và trang phục thể thao",
        level: 0,
        image: "https://placehold.co/400x300/4CAF50/FFFFFF?text=THE+THAO",
        banner: "https://placehold.co/1200x400/4CAF50/FFFFFF?text=THE+THAO",
        sortOrder: 7,
        isNavigation: true,
        isFeatured: true,
      },
      {
        name: "Black Friday",
        slug: "black-friday",
        description: "Ưu đãi đặc biệt Black Friday",
        level: 0,
        image: "https://placehold.co/400x300/000000/FF0000?text=BLACK+FRIDAY",
        banner:
          "https://placehold.co/1200x400/000000/FF0000?text=BLACK+FRIDAY+SALE",
        sortOrder: 8,
        isNavigation: true,
        isFeatured: true,
      },
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log("✅ Created main categories");

    // Create Subcategories theo cấu trúc frontend navigation
    const namCategory = createdCategories.find((c) => c.slug === "nam");
    const nuCategory = createdCategories.find((c) => c.slug === "nu");
    const treEmCategory = createdCategories.find((c) => c.slug === "tre-em");
    const sportsCategory = createdCategories.find((c) => c.slug === "sports");

    const subcategories = [
      // Nam subcategories - theo menCategories trong frontend
      {
        name: "Giày",
        slug: "nam-giay",
        description: "Giày dành cho nam",
        level: 1,
        parentCategory: namCategory._id,
        image: "https://placehold.co/300x200/0066CC/FFFFFF?text=GIAY+NAM",
        sortOrder: 1,
        isNavigation: true,
      },
      {
        name: "Quần Áo",
        slug: "nam-quan-ao",
        description: "Quần áo dành cho nam",
        level: 1,
        parentCategory: namCategory._id,
        image: "https://placehold.co/300x200/0066CC/FFFFFF?text=QUAN+AO+NAM",
        sortOrder: 2,
        isNavigation: true,
      },
      {
        name: "Phụ Kiện",
        slug: "nam-phu-kien",
        description: "Phụ kiện dành cho nam",
        level: 1,
        parentCategory: namCategory._id,
        image: "https://placehold.co/300x200/0066CC/FFFFFF?text=PHU+KIEN+NAM",
        sortOrder: 3,
        isNavigation: true,
      },

      // Nữ subcategories - theo womenCategories
      {
        name: "Giày",
        slug: "nu-giay",
        description: "Giày dành cho nữ",
        level: 1,
        parentCategory: nuCategory._id,
        image: "https://placehold.co/300x200/FF6B9D/FFFFFF?text=GIAY+NU",
        sortOrder: 1,
        isNavigation: true,
      },
      {
        name: "Quần Áo",
        slug: "nu-quan-ao",
        description: "Quần áo dành cho nữ",
        level: 1,
        parentCategory: nuCategory._id,
        image: "https://placehold.co/300x200/FF6B9D/FFFFFF?text=QUAN+AO+NU",
        sortOrder: 2,
        isNavigation: true,
      },
      {
        name: "Phụ Kiện",
        slug: "nu-phu-kien",
        description: "Phụ kiện dành cho nữ",
        level: 1,
        parentCategory: nuCategory._id,
        image: "https://placehold.co/300x200/FF6B9D/FFFFFF?text=PHU+KIEN+NU",
        sortOrder: 3,
        isNavigation: true,
      },

      // Trẻ em subcategories - theo kidsCategories
      {
        name: "Giày Trẻ Em",
        slug: "tre-em-giay",
        description: "Giày dành cho trẻ em",
        level: 1,
        parentCategory: treEmCategory._id,
        image: "https://placehold.co/300x200/FFA500/FFFFFF?text=GIAY+TRE+EM",
        sortOrder: 1,
        isNavigation: true,
      },
      {
        name: "Quần Áo Trẻ Em",
        slug: "tre-em-quan-ao",
        description: "Quần áo dành cho trẻ em",
        level: 1,
        parentCategory: treEmCategory._id,
        image: "https://placehold.co/300x200/FFA500/FFFFFF?text=QUAN+AO+TRE+EM",
        sortOrder: 2,
        isNavigation: true,
      },
      {
        name: "Phụ Kiện Trẻ Em",
        slug: "tre-em-phu-kien",
        description: "Phụ kiện dành cho trẻ em",
        level: 1,
        parentCategory: treEmCategory._id,
        image:
          "https://placehold.co/300x200/FFA500/FFFFFF?text=PHU+KIEN+TRE+EM",
        sortOrder: 3,
        isNavigation: true,
      },

      // Thể thao subcategories - theo sportsCategories
      {
        name: "Bóng Đá",
        slug: "bong-da",
        description: "Dụng cụ bóng đá",
        level: 1,
        parentCategory: sportsCategory._id,
        image: "https://placehold.co/300x200/4CAF50/FFFFFF?text=BONG+DA",
        sortOrder: 1,
        isNavigation: true,
      },
      {
        name: "Bóng Rổ",
        slug: "bong-ro",
        description: "Dụng cụ bóng rổ",
        level: 1,
        parentCategory: sportsCategory._id,
        image: "https://placehold.co/300x200/4CAF50/FFFFFF?text=BONG+RO",
        sortOrder: 2,
        isNavigation: true,
      },
      {
        name: "Chạy Bộ",
        slug: "chay-bo",
        description: "Dụng cụ chạy bộ",
        level: 1,
        parentCategory: sportsCategory._id,
        image: "https://placehold.co/300x200/4CAF50/FFFFFF?text=CHAY+BO",
        sortOrder: 3,
        isNavigation: true,
      },
    ];

    const createdSubcategories = await Category.insertMany(subcategories);
    console.log("✅ Created subcategories");

    // Create subcategories for Bộ Sưu Tập
    const boSuuTapCategory = createdCategories.find(
      (c) => c.slug === "bo-suu-tap"
    );
    const boSuuTapSubcategories = [
      {
        name: "Bộ Sưu Tập Thương Hiệu",
        slug: "bst-thuong-hieu",
        description: "Bộ sưu tập collaboration với các thương hiệu",
        level: 1,
        parentCategory: boSuuTapCategory._id,
        image:
          "https://placehold.co/300x200/9C27B0/FFFFFF?text=BST+THUONG+HIEU",
        sortOrder: 1,
        isNavigation: true,
      },
      {
        name: "Bộ Sưu Tập Mùa",
        slug: "bst-mua",
        description: "Bộ sưu tập theo mùa",
        level: 1,
        parentCategory: boSuuTapCategory._id,
        image: "https://placehold.co/300x200/9C27B0/FFFFFF?text=BST+MUA",
        sortOrder: 2,
        isNavigation: true,
      },
      {
        name: "Bộ Sưu Tập Đặc Biệt",
        slug: "bst-dac-biet",
        description: "Bộ sưu tập giới hạn và đặc biệt",
        level: 1,
        parentCategory: boSuuTapCategory._id,
        image: "https://placehold.co/300x200/9C27B0/FFFFFF?text=BST+DAC+BIET",
        sortOrder: 3,
        isNavigation: true,
      },
    ];

    await Category.insertMany(boSuuTapSubcategories);
    console.log("✅ Created Bộ Sưu Tập subcategories");

    // Update createdSubcategories to include new ones
    const allSubcategories = await Category.find({ level: 1 });

    // Create Sub-subcategories (Level 2)
    const namQuanAoCategory = allSubcategories.find(
      (c) => c.slug === "nam-quan-ao"
    );
    const namGiayCategory = allSubcategories.find((c) => c.slug === "nam-giay");
    const nuQuanAoCategory = allSubcategories.find(
      (c) => c.slug === "nu-quan-ao"
    );
    const nuGiayCategory = allSubcategories.find((c) => c.slug === "nu-giay");

    const subSubcategories = [
      // Nam sub-subcategories
      {
        name: "Áo Thun",
        slug: "nam-ao-thun",
        description: "Áo thun nam",
        level: 2,
        parentCategory: namQuanAoCategory._id,
        image: "https://placehold.co/250x150/0066CC/FFFFFF?text=AO+THUN",
        sortOrder: 1,
        isNavigation: true,
      },
      {
        name: "Áo Polo",
        slug: "nam-ao-polo",
        description: "Áo polo nam",
        level: 2,
        parentCategory: namQuanAoCategory._id,
        image: "https://placehold.co/250x150/0066CC/FFFFFF?text=AO+POLO",
        sortOrder: 2,
        isNavigation: true,
      },
      {
        name: "Áo Khoác",
        slug: "nam-ao-khoac",
        description: "Áo khoác nam",
        level: 2,
        parentCategory: namQuanAoCategory._id,
        image: "https://placehold.co/250x150/0066CC/FFFFFF?text=AO+KHOAC",
        sortOrder: 3,
        isNavigation: true,
      },
      {
        name: "Quần Dài",
        slug: "nam-quan-dai",
        description: "Quần dài nam",
        level: 2,
        parentCategory: namQuanAoCategory._id,
        image: "https://placehold.co/250x150/0066CC/FFFFFF?text=QUAN+DAI",
        sortOrder: 4,
        isNavigation: true,
      },
      {
        name: "Quần Ngắn",
        slug: "nam-quan-ngan",
        description: "Quần ngắn nam",
        level: 2,
        parentCategory: namQuanAoCategory._id,
        image: "https://placehold.co/250x150/0066CC/FFFFFF?text=QUAN+NGAN",
        sortOrder: 5,
        isNavigation: true,
      },
      {
        name: "Giày Chạy Bộ",
        slug: "nam-giay-chay-bo",
        description: "Giày chạy bộ nam",
        level: 2,
        parentCategory: namGiayCategory._id,
        image: "https://placehold.co/250x150/0066CC/FFFFFF?text=GIAY+CHAY+BO",
        sortOrder: 1,
        isNavigation: true,
      },
      {
        name: "Giày Tập Luyện",
        slug: "nam-giay-tap-luyen",
        description: "Giày tập luyện nam",
        level: 2,
        parentCategory: namGiayCategory._id,
        image: "https://placehold.co/250x150/0066CC/FFFFFF?text=GIAY+TAP+LUYEN",
        sortOrder: 2,
        isNavigation: true,
      },
      {
        name: "Giày Bóng Đá",
        slug: "nam-giay-bong-da",
        description: "Giày bóng đá nam",
        level: 2,
        parentCategory: namGiayCategory._id,
        image: "https://placehold.co/250x150/0066CC/FFFFFF?text=GIAY+BONG+DA",
        sortOrder: 3,
        isNavigation: true,
      },
      {
        name: "Sneakers",
        slug: "nam-sneakers",
        description: "Giày sneakers nam",
        level: 2,
        parentCategory: namGiayCategory._id,
        image: "https://placehold.co/250x150/0066CC/FFFFFF?text=SNEAKERS",
        sortOrder: 4,
        isNavigation: true,
      },

      // Nữ sub-subcategories
      {
        name: "Áo Thun",
        slug: "nu-ao-thun",
        description: "Áo thun nữ",
        level: 2,
        parentCategory: nuQuanAoCategory._id,
        image: "https://placehold.co/250x150/FF6B9D/FFFFFF?text=AO+THUN",
        sortOrder: 1,
        isNavigation: true,
      },
      {
        name: "Áo Kiểu",
        slug: "nu-ao-kieu",
        description: "Áo kiểu nữ",
        level: 2,
        parentCategory: nuQuanAoCategory._id,
        image: "https://placehold.co/250x150/FF6B9D/FFFFFF?text=AO+KIEU",
        sortOrder: 2,
        isNavigation: true,
      },
      {
        name: "Áo Khoác",
        slug: "nu-ao-khoac",
        description: "Áo khoác nữ",
        level: 2,
        parentCategory: nuQuanAoCategory._id,
        image: "https://placehold.co/250x150/FF6B9D/FFFFFF?text=AO+KHOAC",
        sortOrder: 3,
        isNavigation: true,
      },
      {
        name: "Váy",
        slug: "nu-vay",
        description: "Váy nữ",
        level: 2,
        parentCategory: nuQuanAoCategory._id,
        image: "https://placehold.co/250x150/FF6B9D/FFFFFF?text=VAY",
        sortOrder: 4,
        isNavigation: true,
      },
      {
        name: "Quần Dài",
        slug: "nu-quan-dai",
        description: "Quần dài nữ",
        level: 2,
        parentCategory: nuQuanAoCategory._id,
        image: "https://placehold.co/250x150/FF6B9D/FFFFFF?text=QUAN+DAI",
        sortOrder: 5,
        isNavigation: true,
      },
      {
        name: "Quần Ngắn",
        slug: "nu-quan-ngan",
        description: "Quần ngắn nữ",
        level: 2,
        parentCategory: nuQuanAoCategory._id,
        image: "https://placehold.co/250x150/FF6B9D/FFFFFF?text=QUAN+NGAN",
        sortOrder: 6,
        isNavigation: true,
      },
      {
        name: "Giày Chạy Bộ",
        slug: "nu-giay-chay-bo",
        description: "Giày chạy bộ nữ",
        level: 2,
        parentCategory: nuGiayCategory._id,
        image: "https://placehold.co/250x150/FF6B9D/FFFFFF?text=GIAY+CHAY+BO",
        sortOrder: 1,
        isNavigation: true,
      },
      {
        name: "Giày Tập Luyện",
        slug: "nu-giay-tap-luyen",
        description: "Giày tập luyện nữ",
        level: 2,
        parentCategory: nuGiayCategory._id,
        image: "https://placehold.co/250x150/FF6B9D/FFFFFF?text=GIAY+TAP+LUYEN",
        sortOrder: 2,
        isNavigation: true,
      },
      {
        name: "Giày Cao Gót Thể Thao",
        slug: "nu-giay-cao-got",
        description: "Giày cao gót thể thao nữ",
        level: 2,
        parentCategory: nuGiayCategory._id,
        image: "https://placehold.co/250x150/FF6B9D/FFFFFF?text=GIAY+CAO+GOT",
        sortOrder: 3,
        isNavigation: true,
      },
      {
        name: "Sneakers",
        slug: "nu-sneakers",
        description: "Giày sneakers nữ",
        level: 2,
        parentCategory: nuGiayCategory._id,
        image: "https://placehold.co/250x150/FF6B9D/FFFFFF?text=SNEAKERS",
        sortOrder: 4,
        isNavigation: true,
      },
    ];

    const createdSubSubcategories = await Category.insertMany(subSubcategories);
    console.log("✅ Created sub-subcategories");

    // Create Brands - theo brandsCategories trong frontend
    const brands = [
      // THƯƠNG HIỆU HÀNG ĐẦU
      {
        name: "Nike",
        slug: "nike",
        description: "Just Do It - Thương hiệu thể thao hàng đầu thế giới",
        logo: "https://placehold.co/200x100/000000/FFFFFF?text=NIKE",
        banner:
          "https://placehold.co/1200x400/000000/FFFFFF?text=NIKE+JUST+DO+IT",
        country: "USA",
        website: "https://nike.com",
        isFeatured: true,
        isPremium: true,
        sortOrder: 1,
      },
      {
        name: "Adidas",
        slug: "adidas",
        description: "Impossible is Nothing - Thương hiệu thể thao Đức",
        logo: "https://placehold.co/200x100/000000/FFFFFF?text=ADIDAS",
        banner:
          "https://placehold.co/1200x400/000000/FFFFFF?text=ADIDAS+IMPOSSIBLE+IS+NOTHING",
        country: "Germany",
        website: "https://adidas.com",
        isFeatured: true,
        isPremium: true,
        sortOrder: 2,
      },
      {
        name: "Puma",
        slug: "puma",
        description: "Forever Faster - Thương hiệu thể thao Đức",
        logo: "https://placehold.co/200x100/000000/FFFFFF?text=PUMA",
        banner:
          "https://placehold.co/1200x400/000000/FFFFFF?text=PUMA+FOREVER+FASTER",
        country: "Germany",
        website: "https://puma.com",
        isFeatured: true,
        isPremium: true,
        sortOrder: 3,
      },
      {
        name: "New Balance",
        slug: "new-balance",
        description: "Endorsed by No One - Thương hiệu giày thể thao Mỹ",
        logo: "https://placehold.co/200x100/000000/FFFFFF?text=NEW+BALANCE",
        banner: "https://placehold.co/1200x400/000000/FFFFFF?text=NEW+BALANCE",
        country: "USA",
        website: "https://newbalance.com",
        isFeatured: true,
        sortOrder: 4,
      },
      {
        name: "Converse",
        slug: "converse",
        description: "All Star - Thương hiệu giày canvas iconic",
        logo: "https://placehold.co/200x100/000000/FFFFFF?text=CONVERSE",
        banner:
          "https://placehold.co/1200x400/000000/FFFFFF?text=CONVERSE+ALL+STAR",
        country: "USA",
        website: "https://converse.com",
        isFeatured: true,
        sortOrder: 5,
      },
      {
        name: "Vans",
        slug: "vans",
        description: "Off The Wall - Thương hiệu skateboard lifestyle",
        logo: "https://placehold.co/200x100/000000/FFFFFF?text=VANS",
        banner:
          "https://placehold.co/1200x400/000000/FFFFFF?text=VANS+OFF+THE+WALL",
        country: "USA",
        website: "https://vans.com",
        isFeatured: true,
        sortOrder: 6,
      },
      {
        name: "Under Armour",
        slug: "under-armour",
        description: "I Will - Thương hiệu thể thao performance Mỹ",
        logo: "https://placehold.co/200x100/000000/FFFFFF?text=UNDER+ARMOUR",
        banner:
          "https://placehold.co/1200x400/000000/FFFFFF?text=UNDER+ARMOUR+I+WILL",
        country: "USA",
        website: "https://underarmour.com",
        isFeatured: true,
        sortOrder: 7,
      },
      {
        name: "Reebok",
        slug: "reebok",
        description: "Be More Human - Thương hiệu fitness lifestyle",
        logo: "https://placehold.co/200x100/000000/FFFFFF?text=REEBOK",
        banner:
          "https://placehold.co/1200x400/000000/FFFFFF?text=REEBOK+BE+MORE+HUMAN",
        country: "USA",
        website: "https://reebok.com",
        isFeatured: true,
        sortOrder: 8,
      },

      // THƯƠNG HIỆU LUXURY
      {
        name: "Balenciaga",
        slug: "balenciaga",
        description: "Luxury fashion house - Haute couture và streetwear",
        logo: "https://placehold.co/200x100/000000/FFFFFF?text=BALENCIAGA",
        banner:
          "https://placehold.co/1200x400/000000/FFFFFF?text=BALENCIAGA+LUXURY",
        country: "France",
        website: "https://balenciaga.com",
        isFeatured: false,
        isPremium: true,
        sortOrder: 20,
      },
      {
        name: "Gucci",
        slug: "gucci",
        description: "Italian luxury fashion house - High-end fashion",
        logo: "https://placehold.co/200x100/000000/FFFFFF?text=GUCCI",
        banner: "https://placehold.co/1200x400/000000/FFFFFF?text=GUCCI+LUXURY",
        country: "Italy",
        website: "https://gucci.com",
        isFeatured: false,
        isPremium: true,
        sortOrder: 21,
      },

      // THƯƠNG HIỆU STREETWEAR
      {
        name: "Supreme",
        slug: "supreme",
        description: "Streetwear brand - Limited drops và collaborations",
        logo: "https://placehold.co/200x100/FF0000/FFFFFF?text=SUPREME",
        banner:
          "https://placehold.co/1200x400/FF0000/FFFFFF?text=SUPREME+STREETWEAR",
        country: "USA",
        website: "https://supremenewyork.com",
        isFeatured: false,
        isPremium: true,
        sortOrder: 30,
      },
      {
        name: "BAPE",
        slug: "bape",
        description: "A Bathing Ape - Japanese streetwear pioneer",
        logo: "https://placehold.co/200x100/000000/FFFFFF?text=BAPE",
        banner:
          "https://placehold.co/1200x400/000000/FFFFFF?text=BAPE+STREETWEAR",
        country: "Japan",
        website: "https://bape.com",
        isFeatured: false,
        isPremium: true,
        sortOrder: 31,
      },
    ];

    const createdBrands = await Brand.insertMany(brands);
    console.log("✅ Created brands");

    // Create Products
    const nikeBrand = createdBrands.find((b) => b.slug === "nike");
    const adidasBrand = createdBrands.find((b) => b.slug === "adidas");
    const pumaBrand = createdBrands.find((b) => b.slug === "puma");

    const namGiayCategoryForProducts = createdSubcategories.find(
      (c) => c.slug === "nam-giay"
    );
    const aoThunCategory = createdSubSubcategories.find(
      (c) => c.slug === "nam-ao-thun"
    );

    const products = [
      // Nike Products
      {
        name: "Nike Air Max 90 Essential",
        slug: "nike-air-max-90-essential",
        description:
          "Giày thể thao Nike Air Max 90 Essential với thiết kế iconic và công nghệ đệm khí Max Air. Mang lại sự thoải mái tối đa cho mọi hoạt động.",
        shortDescription: "Giày thể thao Nike Air Max 90 với công nghệ đệm khí",
        sku: "NIKE-AM90-001",
        category: namGiayCategoryForProducts._id,
        brand: nikeBrand._id,
        originalPrice: 2890000,
        salePrice: 2390000,
        inventory: {
          inStock: true,
          quantity: 50,
          lowStockThreshold: 10,
        },
        images: [
          {
            url: "https://placehold.co/600x400/000000/FFFFFF?text=NIKE+AIR+MAX+90",
            alt: "Nike Air Max 90 Essential",
            isPrimary: true,
            sortOrder: 0,
          },
          {
            url: "https://placehold.co/600x400/FF0000/FFFFFF?text=NIKE+AIR+MAX+90+RED",
            alt: "Nike Air Max 90 Essential Red",
            isPrimary: false,
            sortOrder: 1,
          },
        ],
        attributes: {
          color: ["Đen", "Trắng", "Đỏ"],
          size: ["39", "40", "41", "42", "43", "44"],
          gender: "men",
          sport: ["running", "lifestyle"],
          material: ["Mesh", "Synthetic"],
          features: ["Air Max", "Thoáng khí", "Nhẹ"],
        },
        isFeatured: true,
        isNewArrival: true,
        rating: {
          average: 4.5,
          count: 128,
        },
        soldCount: 89,
        viewCount: 1250,
      },
      {
        name: "Nike Dri-FIT T-Shirt",
        slug: "nike-dri-fit-tshirt",
        description:
          "Áo thun thể thao Nike Dri-FIT với công nghệ thấm hút mồ hôi, giữ cho bạn luôn khô ráo trong quá trình tập luyện.",
        shortDescription: "Áo thun thể thao Nike với công nghệ Dri-FIT",
        sku: "NIKE-DF-TSHIRT-001",
        category: aoThunCategory._id,
        brand: nikeBrand._id,
        originalPrice: 890000,
        inventory: {
          inStock: true,
          quantity: 100,
        },
        images: [
          {
            url: "https://placehold.co/500x600/000000/FFFFFF?text=NIKE+DRI-FIT+TSHIRT",
            alt: "Nike Dri-FIT T-Shirt",
            isPrimary: true,
            sortOrder: 0,
          },
        ],
        attributes: {
          color: ["Đen", "Trắng", "Xanh"],
          size: ["S", "M", "L", "XL", "XXL"],
          gender: "men",
          sport: ["training", "running"],
          material: ["Polyester"],
          features: ["Dri-FIT", "Thoáng khí"],
        },
        isFeatured: true,
        isBestSeller: true,
        rating: {
          average: 4.7,
          count: 256,
        },
        soldCount: 189,
      },
      // Adidas Products
      {
        name: "Adidas Ultraboost 23",
        slug: "adidas-ultraboost-23",
        description:
          "Giày chạy bộ Adidas Ultraboost 23 với công nghệ BOOST và đế Continental. Mang lại năng lượng trở về với mỗi bước chạy.",
        shortDescription: "Giày chạy bộ Adidas với công nghệ BOOST",
        sku: "ADIDAS-UB23-001",
        category: namGiayCategoryForProducts._id,
        brand: adidasBrand._id,
        originalPrice: 4190000,
        inventory: {
          inStock: true,
          quantity: 30,
        },
        images: [
          {
            url: "https://placehold.co/600x400/000000/FFFFFF?text=ADIDAS+ULTRABOOST+23",
            alt: "Adidas Ultraboost 23",
            isPrimary: true,
            sortOrder: 0,
          },
        ],
        attributes: {
          color: ["Đen", "Trắng", "Xanh"],
          size: ["39", "40", "41", "42", "43", "44", "45"],
          gender: "men",
          sport: ["running"],
          material: ["Primeknit"],
          features: ["BOOST", "Continental", "Thoáng khí"],
        },
        isFeatured: true,
        isNewArrival: true,
        rating: {
          average: 4.8,
          count: 92,
        },
        soldCount: 45,
      },
      // Women Products
      {
        name: "Nike Air Max 270 Women",
        slug: "nike-air-max-270-women",
        description:
          "Giày thể thao Nike Air Max 270 dành cho nữ với thiết kế hiện đại và đệm khí tuyệt vời.",
        shortDescription: "Giày thể thao Nike Air Max 270 cho nữ",
        sku: "NIKE-AM270-W001",
        category: namGiayCategoryForProducts._id, // Will use gender filter instead
        brand: nikeBrand._id,
        originalPrice: 3200000,
        inventory: {
          inStock: true,
          quantity: 40,
        },
        images: [
          {
            url: "https://placehold.co/600x400/FFB6C1/FFFFFF?text=NIKE+AIR+MAX+270+WOMEN",
            alt: "Nike Air Max 270 Women",
            isPrimary: true,
            sortOrder: 0,
          },
        ],
        attributes: {
          color: ["Hồng", "Trắng", "Đen"],
          size: ["36", "37", "38", "39", "40"],
          gender: "women",
          sport: ["lifestyle", "fitness"],
          material: ["Mesh", "Synthetic"],
          features: ["Air Max", "Thoáng khí", "Nhẹ"],
        },
        isFeatured: true,
        isNewArrival: true,
        rating: {
          average: 4.6,
          count: 95,
        },
        soldCount: 67,
      },
      {
        name: "Adidas UltraBoost 22 Women",
        slug: "adidas-ultraboost-22-women",
        description:
          "Giày chạy bộ Adidas UltraBoost 22 dành cho nữ với công nghệ BOOST tuyệt vời.",
        shortDescription: "Giày chạy bộ Adidas UltraBoost cho nữ",
        sku: "ADIDAS-UB22-W001",
        category: namGiayCategoryForProducts._id,
        brand: adidasBrand._id,
        originalPrice: 4500000,
        salePrice: 3600000,
        inventory: {
          inStock: true,
          quantity: 25,
        },
        images: [
          {
            url: "https://placehold.co/600x400/FFB6C1/000000?text=ADIDAS+ULTRABOOST+22+WOMEN",
            alt: "Adidas UltraBoost 22 Women",
            isPrimary: true,
            sortOrder: 0,
          },
        ],
        attributes: {
          color: ["Hồng", "Tím", "Trắng"],
          size: ["36", "37", "38", "39", "40", "41"],
          gender: "women",
          sport: ["running"],
          material: ["Primeknit"],
          features: ["BOOST", "Continental", "Thoáng khí"],
        },
        isFeatured: false,
        isNewArrival: true,
        rating: {
          average: 4.7,
          count: 43,
        },
        soldCount: 28,
      },
      // Kids Products
      {
        name: "Nike Air Force 1 Kids",
        slug: "nike-air-force-1-kids",
        description:
          "Giày thể thao Nike Air Force 1 dành cho trẻ em với thiết kế classic và bền bỉ.",
        shortDescription: "Giày Nike Air Force 1 cho trẻ em",
        sku: "NIKE-AF1-K001",
        category: namGiayCategoryForProducts._id,
        brand: nikeBrand._id,
        originalPrice: 2200000,
        inventory: {
          inStock: true,
          quantity: 60,
        },
        images: [
          {
            url: "https://placehold.co/600x400/87CEEB/FFFFFF?text=NIKE+AIR+FORCE+1+KIDS",
            alt: "Nike Air Force 1 Kids",
            isPrimary: true,
            sortOrder: 0,
          },
        ],
        attributes: {
          color: ["Trắng", "Đen", "Xanh"],
          size: ["28", "29", "30", "31", "32", "33", "34", "35"],
          gender: "kids",
          sport: ["lifestyle"],
          material: ["Leather", "Synthetic"],
          features: ["Air Sole", "Bền bỉ"],
        },
        isFeatured: true,
        isNewArrival: false,
        rating: {
          average: 4.4,
          count: 86,
        },
        soldCount: 124,
      },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log("✅ Created products");

    // Update summary to reflect all created data
    const allCreatedCategories = await Category.find({});
    const allCreatedSubcategories = allCreatedCategories.filter(
      (c) => c.level === 1
    );
    const allCreatedSubSubcategories = allCreatedCategories.filter(
      (c) => c.level === 2
    );

    console.log(`
🎉 Seeding completed successfully!
📊 Summary:
   - Main Categories: ${createdCategories.length}
   - Subcategories: ${allCreatedSubcategories.length}  
   - Sub-subcategories: ${allCreatedSubSubcategories.length}
   - Total Categories: ${allCreatedCategories.length}
   - Brands: ${createdBrands.length}
   - Products: ${createdProducts.length}

🔗 Test APIs:
   GET /api/categories/navigation
   GET /api/brands/featured
   GET /api/products/featured
   GET /api/products/category/nam-giay
    `);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
  } finally {
    await mongoose.connection.close();
    console.log("👋 Database connection closed");
    process.exit(0);
  }
};

seedData();
