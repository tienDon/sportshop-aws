import { prisma } from "../lib/prisma.js";

export class CategoryService {
  static async createCategory(data: {
    name: string;
    slug: string;
    parentId: number | null;
  }) {
    if (data.parentId == null) {
      const existingCategory = await prisma.category.findUnique({
        where: { name: data.name, slug: data.slug },
      });
      if (existingCategory) {
        throw new Error(
          "Category with the same name or slug at root already exists"
        );
      }
    }
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        parentId: data.parentId,
      },
    });
    return category;
  }

  static async getCategoryTree() {
    return await prisma.category.findMany({
      where: { parentId: null },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
    });
  }

  static async deleteAllCategories() {
    return prisma.category.deleteMany();
  }

  static async getCategoryById(id: number) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
    });
  }

  static async addAudiencesToCategory(
    categoryId: number,
    audienceIds: number[],
    sort_order?: number
  ) {
    // Xóa các liên kết cũ nếu muốn (optional - tùy logic của bạn, ở đây tôi làm kiểu "thêm mới/ghi đè")
    // await prisma.categoryAudience.deleteMany({ where: { categoryId } });

    // Tạo data cho createMany
    const data = audienceIds.map((audienceId) => ({
      categoryId,
      audienceId,
      sortOrder: sort_order ?? 0, // Mặc định
    }));

    // Dùng createMany để insert nhiều dòng cùng lúc (skipDuplicates để tránh lỗi nếu đã tồn tại)
    return await prisma.categoryAudience.createMany({
      data,
      skipDuplicates: true,
    });
  }

  static async addAttributesToCategory(
    categoryId: number,
    attributeIds: number[]
  ) {
    const data = attributeIds.map((attributeId) => ({
      categoryId,
      attributeId,
    }));

    return await prisma.categoryAttribute.createMany({
      data,
      skipDuplicates: true,
    });
  }

  static async getCategoryByAudienceSlug(audienceSlug: string) {
    // 1. Tìm Audience ID từ Slug
    const audience = await prisma.audience.findUnique({
      where: { slug: audienceSlug },
    });

    if (!audience) {
      throw new Error("Audience not found");
    }

    // 2. Lấy tất cả Category có liên kết với Audience này
    // Chỉ lấy các category cha (parentId = null) để xây dựng cây từ gốc
    const categories = await prisma.category.findMany({
      where: {
        parentId: null, // Chỉ lấy root categories
        categoryAudiences: {
          some: {
            audienceId: audience.id,
          },
        },
      },
      include: {
        children: {
          include: {
            children: true, // Deep nested children...
          },
        },
      },
    });

    return categories;
  }

  static async getCategoryAttributes(categoryId: number) {
    const categoryAttributes = await prisma.categoryAttribute.findMany({
      where: { categoryId },
      include: {
        attribute: {},
      },
    });
    return categoryAttributes;
  }

  static async getCategoryIdBySlug(slug: string) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          include: {
            children: true,
          },
        },
      },
    });
  }

  static async updateCategory(
    id: number,
    data: {
      name?: string;
      slug?: string;
      parentId?: number | null;
    }
  ) {
    return await prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.parentId !== undefined && { parentId: data.parentId }),
      },
    });
  }

  static async deleteCategory(id: number) {
    return await prisma.category.delete({
      where: { id },
    });
  }

  static async getAllCategories() {
    return await prisma.category.findMany({
      include: {
        parent: true,
        categoryAudiences: {
          include: {
            audience: true,
          },
        },
        categoryAttributes: {
          include: {
            attribute: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  static async getCategoryAudiences(categoryId: number) {
    const categoryAudiences = await prisma.categoryAudience.findMany({
      where: { categoryId },
      include: {
        audience: true,
      },
    });
    return categoryAudiences;
  }
}
