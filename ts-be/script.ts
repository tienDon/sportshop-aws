import { prisma } from "./src/lib/prisma.js";
// import { Prisma, Role, Gender, SizeChartType } from "@prisma/client";
import { Role, Gender, SizeChartType } from "./generated/prisma/enums";
import { Prisma } from "./generated/prisma/client.js";

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting seed process...");

    // =========================================================================
    // 1. CLEAR EXISTING DATA (Phải xóa theo thứ tự ngược lại của quan hệ)
    // =========================================================================
    console.log("🧹 Clearing existing data...");
    await prisma.$transaction([
      prisma.orderItem.deleteMany(),
      prisma.order.deleteMany(),
      prisma.cartItem.deleteMany(),
      prisma.cart.deleteMany(),
      prisma.productVariant.deleteMany(),
      prisma.productImage.deleteMany(),
      prisma.productAttributeValue.deleteMany(),
      prisma.productSport.deleteMany(),
      prisma.productCategory.deleteMany(),
      prisma.product.deleteMany(),
      prisma.categoryAttribute.deleteMany(),
      prisma.attributeValue.deleteMany(),
      prisma.attribute.deleteMany(),
      prisma.category.deleteMany(),
      prisma.badge.deleteMany(),
      prisma.size.deleteMany(),
      prisma.color.deleteMany(),
      prisma.sport.deleteMany(),
      prisma.brand.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    // =========================================================================
    // 2. CORE DATA: Brands, Sports, Colors, Sizes, Badges
    // =========================================================================

    // Brands
    console.log("🌱 Creating brands...");
    const uaBrand = await prisma.brand.create({
      data: { name: "Under Armour", slug: "under-armour", isActive: true },
    });
    const nikeBrand = await prisma.brand.create({
      data: { name: "Nike", slug: "nike", isActive: true },
    });
    await prisma.brand.createMany({
      data: [
        { name: "Adidas", slug: "adidas", isActive: true },
        { name: "Puma", slug: "puma", isActive: true },
        { name: "New Balance", slug: "new-balance", isActive: true },
        { name: "Skechers", slug: "skechers", isActive: true },
      ],
    });

    // Sports
    console.log("🌱 Creating sports...");
    const trainingSport = await prisma.sport.create({
      data: { name: "Tập luyện", slug: "tap-luyen", isActive: true },
    });
    const runningSport = await prisma.sport.create({
      data: { name: "Chạy bộ", slug: "chay-bo", isActive: true },
    });
    await prisma.sport.createMany({
      data: [
        { name: "Bóng đá", slug: "bong-da", isActive: true },
        { name: "Bóng rổ", slug: "bong-ro", isActive: true },
        { name: "Yoga/Studio", slug: "yoga-studio", isActive: true },
        { name: "Đi bộ/Ngoài trời", slug: "di-bo-ngoai-troi", isActive: true },
      ],
    });

    // Colors (Dùng cho ProductVariant)
    console.log("🌱 Creating colors...");
    const redColor = await prisma.color.create({
      data: { name: "Đỏ", hexCode: "#FF0000" },
    });
    const navyColor = await prisma.color.create({
      data: { name: "Xanh Navy", hexCode: "#000080" },
    });
    const blackColor = await prisma.color.create({
      data: { name: "Đen", hexCode: "#000000" },
    });
    await prisma.color.createMany({
      data: [
        { name: "Trắng", hexCode: "#FFFFFF" },
        { name: "Xám", hexCode: "#808080" },
        { name: "Vàng", hexCode: "#FFFF00" },
      ],
    });

    // Sizes (Dùng cho ProductVariant)
    console.log("🌱 Creating sizes...");
    const sizeM_CM = await prisma.size.create({
      data: {
        name: "M",
        chartType: SizeChartType.CLOTHING_MEN,
        sortOrder: 30,
        isActive: true,
      },
    });
    const sizeL_CM = await prisma.size.create({
      data: {
        name: "L",
        chartType: SizeChartType.CLOTHING_MEN,
        sortOrder: 40,
        isActive: true,
      },
    });
    await prisma.size.createMany({
      data: [
        // CLOTHING_MEN
        {
          name: "XS",
          chartType: SizeChartType.CLOTHING_MEN,
          sortOrder: 10,
          isActive: true,
        },
        {
          name: "S",
          chartType: SizeChartType.CLOTHING_MEN,
          sortOrder: 20,
          isActive: true,
        },
        {
          name: "XL",
          chartType: SizeChartType.CLOTHING_MEN,
          sortOrder: 50,
          isActive: true,
        },
        // CLOTHING_WOMEN
        {
          name: "XXS",
          chartType: SizeChartType.CLOTHING_WOMEN,
          sortOrder: 5,
          isActive: true,
        },
        {
          name: "XS",
          chartType: SizeChartType.CLOTHING_WOMEN,
          sortOrder: 10,
          isActive: true,
        },
        {
          name: "S",
          chartType: SizeChartType.CLOTHING_WOMEN,
          sortOrder: 20,
          isActive: true,
        },
        // SHOES_MEN (39, 40, 41, 42, 43, 44)
        {
          name: "39",
          chartType: SizeChartType.SHOES_MEN,
          sortOrder: 10,
          isActive: true,
        },
        {
          name: "40",
          chartType: SizeChartType.SHOES_MEN,
          sortOrder: 20,
          isActive: true,
        },
        {
          name: "41",
          chartType: SizeChartType.SHOES_MEN,
          sortOrder: 30,
          isActive: true,
        },
        {
          name: "42",
          chartType: SizeChartType.SHOES_MEN,
          sortOrder: 40,
          isActive: true,
        },
        {
          name: "43",
          chartType: SizeChartType.SHOES_MEN,
          sortOrder: 50,
          isActive: true,
        },
        {
          name: "44",
          chartType: SizeChartType.SHOES_MEN,
          sortOrder: 60,
          isActive: true,
        },
        // ACCESSORIES
        {
          name: "One Size",
          chartType: SizeChartType.ACCESSORIES,
          sortOrder: 10,
          isActive: true,
        },
      ],
    });

    // Badges
    console.log("🌱 Creating badges...");
    const badgeNew = await prisma.badge.create({
      data: {
        name: "New Arrivals",
        slug: "hang-moi",
        displayText: "MỚI",
        displayColor: "#00CC00",
      },
    });
    const badgeSale = await prisma.badge.create({
      data: {
        name: "50% Off",
        slug: "giam-50-phan-tram",
        displayText: "GIẢM 50%",
        displayColor: "#FF0000",
      },
    });

    // =========================================================================
    // 3. ATTRIBUTES (Dùng cho ProductFilter/Category)
    // =========================================================================
    console.log("🌱 Creating generic attributes...");
    // Gender Attribute
    const genderAttr = await prisma.attribute.create({
      data: {
        name: "Giới tính",
        code: "gender",
        isFilterable: true,
        values: {
          create: [
            { value: "Nam", sortOrder: 10 },
            { value: "Nữ", sortOrder: 20 },
            { value: "Trẻ em", sortOrder: 30 },
          ],
        },
      },
      include: { values: true },
    });
    const maleValue = genderAttr.values.find((v) => v.value === "Nam");
    const femaleValue = genderAttr.values.find((v) => v.value === "Nữ");

    // Material Attribute
    const materialAttr = await prisma.attribute.create({
      data: {
        name: "Chất liệu",
        code: "material",
        isFilterable: true,
        values: {
          create: [
            { value: "Polyester", sortOrder: 10 },
            { value: "Cotton", sortOrder: 20 },
            { value: "Da (Leather)", sortOrder: 30 },
          ],
        },
      },
      include: { values: true },
    });
    const polyesterValue = materialAttr.values.find(
      (v) => v.value === "Polyester"
    );

    // **Loại bỏ các Attribute không cần thiết mà bạn đã tạo**
    // Bảng `Color` và `Size` đã được tạo riêng, nên không cần dùng `attribute` cho "Màu sắc", "Kích cỡ" nữa.

    // =========================================================================
    // 4. CATEGORIES (Hierarchy & Attribute Config)
    // =========================================================================
    console.log("🌱 Creating categories...");

    // ROOT CATEGORIES
    const aoCategory = await prisma.category.create({
      data: { name: "Áo", slug: "ao", isActive: true },
    });
    const quanCategory = await prisma.category.create({
      data: { name: "Quần", slug: "quan", isActive: true },
    });
    const giayTheThaoCategory = await prisma.category.create({
      data: { name: "Giày Thể Thao", slug: "giay-the-thao", isActive: true },
    });
    const giayDepCategory = await prisma.category.create({
      data: { name: "Giày Dép", slug: "giay-dep", isActive: true },
    });
    const phuKienCategory = await prisma.category.create({
      data: { name: "Phụ Kiện", slug: "phu-kien", isActive: true },
    });

    // SUBCATEGORIES (Chỉ tạo 2 loại cho demo sản phẩm)
    const aoThunCategory = await prisma.category.create({
      data: {
        name: "Áo Thun",
        slug: "ao-thun",
        parentId: aoCategory.id,
        isActive: true,
      },
    });
    const quanNganCategory = await prisma.category.create({
      data: {
        name: "Quần Ngắn",
        slug: "quan-ngan",
        parentId: quanCategory.id,
        isActive: true,
      },
    });

    // Tạo CategoryAttributes (Liên kết Attribute với Category)
    console.log("🌱 Linking attributes to root categories...");
    if (genderAttr && materialAttr) {
      // Config cho Áo (Cần Gender, Tùy chọn Material)
      await prisma.categoryAttribute.createMany({
        data: [
          {
            categoryId: aoCategory.id,
            attributeId: genderAttr.id,
            isRequired: true,
            displayOrder: 1,
          },
          {
            categoryId: aoCategory.id,
            attributeId: materialAttr.id,
            isRequired: false,
            displayOrder: 2,
          },
        ],
      });
      // Config cho Quần (Cần Gender, Tùy chọn Material)
      await prisma.categoryAttribute.createMany({
        data: [
          {
            categoryId: quanCategory.id,
            attributeId: genderAttr.id,
            isRequired: true,
            displayOrder: 1,
          },
          {
            categoryId: quanCategory.id,
            attributeId: materialAttr.id,
            isRequired: false,
            displayOrder: 2,
          },
        ],
      });
    }

    // =========================================================================
    // 5. PRODUCTS & VARIANTS
    // =========================================================================
    console.log("🌱 Creating products and variants...");

    // --- PRODUCT 1: Áo Thun UA Tech 2.0 ---
    const product1 = await prisma.product.create({
      data: {
        name: "Áo Thun Tập Luyện UA Tech 2.0",
        slug: "ua-tech-2-0-short-sleeve-t-shirt-nam",
        description: "Áo thun tập luyện UA với công nghệ HeatGear",
        basePrice: new Prisma.Decimal(890000), // Sử dụng Prisma.Decimal
        brandId: uaBrand.id,
        badgeId: badgeSale.id, // Giảm 50%
        isActive: true,

        // 5.1. Variants (Color & Size)
        variants: {
          create: [
            {
              colorId: redColor.id,
              sizeId: sizeM_CM.id,
              price: new Prisma.Decimal(1_000_000), // Giá override
              stockQuantity: 15,
              sku: "UA-TECH-RED-M",
            },
            {
              colorId: navyColor.id,
              sizeId: sizeL_CM.id,
              price: new Prisma.Decimal(2_000_000),
              stockQuantity: 10,
              sku: "UA-TECH-BLUE-L",
            },
          ],
        },

        // 5.2. Images
        images: {
          create: [
            {
              url: "https://picsum.photos/600/600?random=10",
              isMain: true,
              sortOrder: 1,
            },
          ],
        },
      },
    });

    // 5.3. Product Relations (Join Tables)

    // Product Categories
    await prisma.productCategory.createMany({
      data: [
        {
          productId: product1.id,
          categoryId: aoThunCategory.id,
          isPrimary: true,
        },
        { productId: product1.id, categoryId: aoCategory.id, isPrimary: false },
      ],
    });

    // Product Sports
    await prisma.productSport.createMany({
      data: [
        { productId: product1.id, sportId: trainingSport.id },
        { productId: product1.id, sportId: runningSport.id },
      ],
    });

    // Product Attributes (Gender: Nam, Material: Polyester)
    if (maleValue && polyesterValue) {
      await prisma.productAttributeValue.createMany({
        data: [
          { productId: product1.id, attributeValueId: maleValue.id },
          { productId: product1.id, attributeValueId: polyesterValue.id },
        ],
      });
    }

    // --- PRODUCT 2: Quần Short Nike Dri-FIT ---
    const product2 = await prisma.product.create({
      data: {
        name: "Quần Short Nike Dri-FIT",
        slug: "quan-short-nike-dri-fit",
        description: "Quần short thể thao Nike thoáng mát.",
        basePrice: new Prisma.Decimal(750000),
        brandId: nikeBrand.id,
        badgeId: badgeNew.id, // Hàng mới
        isActive: true,

        // 5.1. Variants
        variants: {
          create: [
            {
              colorId: blackColor.id,
              sizeId: sizeM_CM.id,
              price: new Prisma.Decimal(3_000_000),
              stockQuantity: 20,
              sku: "NIKE-SHORT-BLACK-M",
            },
          ],
        },

        // 5.2. Images
        images: {
          create: [
            {
              url: "https://picsum.photos/600/600?random=20",
              isMain: true,
              sortOrder: 1,
            },
          ],
        },
      },
    });

    // 5.3. Product Relations (Join Tables)

    // Product Categories
    await prisma.productCategory.createMany({
      data: [
        {
          productId: product2.id,
          categoryId: quanNganCategory.id,
          isPrimary: true,
        },
        {
          productId: product2.id,
          categoryId: quanCategory.id,
          isPrimary: false,
        },
      ],
    });

    // Product Sports
    await prisma.productSport.create({
      data: { productId: product2.id, sportId: trainingSport.id },
    });

    // Product Attributes (Gender: Nam)
    if (maleValue) {
      await prisma.productAttributeValue.create({
        data: { productId: product2.id, attributeValueId: maleValue.id },
      });
    }

    // =========================================================================
    // 6. DEMO USER
    // =========================================================================
    console.log("🌱 Creating demo user...");
    await prisma.user.create({
      data: {
        email: "demo@example.com",
        password: "hashedpassword123",
        name: "Demo User",
        phone: "0123456789",
        role: Role.CUSTOMER, // Sử dụng Enum Role.CUSTOMER
        gender: Gender.MALE, // Thêm thông tin gender
        isActive: true,
      },
    });

    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
};

export default seedDatabase;

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("🎉 Seeding complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}
