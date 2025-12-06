import { prisma } from "../lib/prisma.js";

// Helper function to slugify string
const toSlug = (str: string): string => {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

interface QueryParams {
  gender_slug?: string;
  gender_id?: string;
  category_slug?: string;
  sport_slug?: string;
  brand_slug?: string;
  badge_slug?: string;
  page?: string | number;
  limit?: string | number;
  sort_by?: string;
}

class ProductService {
  static async getAllProducts(queryParams: QueryParams) {
    const {
      gender_slug,
      gender_id,
      category_slug,
      sport_slug,
      brand_slug,
      badge_slug,
      page = 1,
      limit = 20,
      sort_by,
    } = queryParams;

    const pageInt = parseInt(page.toString());
    const limitInt = parseInt(limit.toString());
    const skip = (pageInt - 1) * limitInt;

    const where: any = { isActive: true };
    const include: any = {
      brand: true,
      categories: {
        include: {
          category: true,
        },
      },
      images: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      variants: {
        where: { isActive: true },
        include: {
          attributes: {
            include: {
              attribute: true,
              attributeValue: true,
            },
          },
        },
      },
      badges: {
        where: { isActive: true },
      },
    };

    // A. Gender filter
    if (gender_slug || gender_id) {
      // For now, we'll implement a simpler version
      // In a full implementation, you'd need to handle attribute-based filtering
      console.log("Gender filtering not fully implemented yet");
    }

    // B. Category filter
    if (category_slug) {
      const category = await prisma.category.findUnique({
        where: { slug: category_slug },
        select: { id: true },
      });

      if (category) {
        // Get all descendant categories
        const categoryIds = await this.getDescendantCategoryIds(category.id);
        where.categories = {
          some: {
            categoryId: { in: categoryIds },
          },
        };
      }
    }

    // C. Brand filter
    if (brand_slug) {
      const brand = await prisma.brand.findUnique({
        where: { slug: brand_slug },
        select: { id: true },
      });

      if (brand) {
        where.brandId = brand.id;
      }
    }

    // D. Badge filter
    if (badge_slug) {
      where.badges = {
        some: {
          slug: badge_slug,
        },
      };
    }

    // E. Sorting
    let orderBy: any = { createdAt: "desc" };

    if (sort_by) {
      switch (sort_by) {
        case "price_asc":
          orderBy = { price: "asc" };
          break;
        case "price_desc":
          orderBy = { price: "desc" };
          break;
        case "name_asc":
          orderBy = { name: "asc" };
          break;
        case "name_desc":
          orderBy = { name: "desc" };
          break;
        case "newest":
          orderBy = { createdAt: "desc" };
          break;
        case "oldest":
          orderBy = { createdAt: "asc" };
          break;
        default:
          orderBy = { createdAt: "desc" };
      }
    }

    // Execute queries
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include,
        skip,
        take: limitInt,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitInt);

    return {
      data: products,
      pagination: {
        page: pageInt,
        limit: limitInt,
        total,
        totalPages,
        hasNext: pageInt < totalPages,
        hasPrev: pageInt > 1,
      },
    };
  }

  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: {
        slug,
        isActive: true,
      },
      include: {
        brand: true,
        categories: {
          include: {
            category: {
              include: {
                parent: true,
              },
            },
          },
        },
        images: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          where: { isActive: true },
          include: {
            attributes: {
              include: {
                attribute: true,
                attributeValue: true,
              },
            },
          },
        },
        badges: {
          where: { isActive: true },
        },
        // reviews: {
        //   where: { isActive: true },
        //   include: {
        //     user: {
        //       select: { id: true, name: true, avatar: true },
        //     },
        //   },
        //   orderBy: { createdAt: "desc" },
        //   take: 10,
        // },
      },
    });

    if (!product) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    return product;
  }

  // Helper method to get all descendant category IDs
  private static async getDescendantCategoryIds(
    parentId: number
  ): Promise<number[]> {
    const ids = [parentId];
    const queue = [parentId];

    while (queue.length > 0) {
      const currentParentId = queue.shift()!;
      const children = await prisma.category.findMany({
        where: { parentId: currentParentId },
        select: { id: true },
      });

      for (const child of children) {
        ids.push(child.id);
        queue.push(child.id);
      }
    }

    return ids;
  }
}

export default ProductService;
