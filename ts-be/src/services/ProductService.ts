import { prisma } from "../lib/prisma.js";
import { Product } from "generated/prisma/client.js";

class ProductService {
  static async createProduct(productData: Product) {
    const newProduct = await prisma.product.create({
      data: productData,
    });
    return newProduct;
  }

  static async getProductsByQuery(filters: any, pagination: any) {
    const whereClause: any = {
      isActive: true, // Mặc định chỉ lấy sản phẩm đang active
    };

    // 1. Lọc theo Category Slug (Thông qua bảng trung gian ProductCategory)
    if (filters.category_slug) {
      whereClause.productCategories = {
        some: {
          category: {
            slug: filters.category_slug,
          },
        },
      };
    }

    // 2. Lọc theo Audience/Gender Slug (Thông qua bảng trung gian ProductAudience)
    if (filters.gender_slug) {
      whereClause.productAudiences = {
        some: {
          audience: {
            slug: filters.gender_slug,
          },
        },
      };
    }

    // 2.1 Lọc theo Brand Slug
    if (filters.brand_slug) {
      whereClause.brand = {
        slug: filters.brand_slug,
      };
    }

    // 2.2 Lọc theo Sport Slug
    if (filters.sport_slug) {
      whereClause.productSports = {
        some: {
          sport: {
            slug: filters.sport_slug,
          },
        },
      };
    }

    // 3. Tìm kiếm theo tên
    if (filters.q) {
      whereClause.name = {
        contains: filters.q,
        // mode: 'insensitive', // MySQL mặc định thường không phân biệt hoa thường, nếu dùng Postgres thì cần dòng này
      };
    }

    // 4. Lọc theo khoảng giá (basePrice)
    if (filters.min_price || filters.max_price) {
      whereClause.basePrice = {};
      if (filters.min_price) {
        whereClause.basePrice.gte = Number(filters.min_price);
      }
      if (filters.max_price) {
        whereClause.basePrice.lte = Number(filters.max_price);
      }
    }

    // 5. Query Database với Select (Chỉ lấy trường cần thiết)
    const limit = Number(pagination.limit) || 16;
    const page = Number(pagination.page) || 1;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        take: limit,
        skip: skip,
        orderBy: {
          createdAt: "desc", // Mặc định mới nhất trước
        },
        select: {
          id: true,
          name: true,
          slug: true,
          mainImageUrl: true,
          basePrice: true,
          badgeId: true,
          // Lấy tên Brand
          brand: {
            select: {
              name: true,
            },
          },
          // Lấy danh sách màu từ Variants (Distinct để không trùng)
          variants: {
            select: {
              color: {
                select: {
                  name: true,
                  hexCode: true,
                },
              },
            },
            distinct: ["colorId"], // Chỉ lấy các màu duy nhất
          },
        },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    // 6. Transform dữ liệu cho đẹp (Flatten structure)
    const transformedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      mainImageUrl: p.mainImageUrl,
      basePrice: p.basePrice,
      badgeId: p.badgeId,
      brandName: p.brand?.name, // Làm phẳng brand name
      colors: p.variants.map((v) => v.color.hexCode), // Chỉ lấy mảng hexCode: ["#FFF", "#000"]
    }));

    return {
      products: transformedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export default ProductService;
