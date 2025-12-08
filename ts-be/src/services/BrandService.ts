import { prisma } from "../lib/prisma.js";

export class BrandService {
  static async getAllBrands() {
    return await prisma.brand.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  static async createBrand(data: {
    name: string;
    description?: string;
    logo?: string;
    banner?: string;
    isActive?: boolean;
    slug?: string;
  }) {
    const {
      name,
      description,
      logo,
      banner,
      isActive,
      slug: providedSlug,
    } = data;

    // Generate slug if not provided
    let slug = providedSlug;
    if (!slug) {
      slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
        .trim()
        .replace(/\s+/g, "-"); // Replace spaces with -
    }

    // Check if slug exists
    const existingBrand = await prisma.brand.findUnique({
      where: { slug },
    });

    if (existingBrand) {
      throw new Error("Brand with this name/slug already exists");
    }

    const newBrand = await prisma.brand.create({
      data: {
        name,
        slug,
        description,
        logo,
        banner,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return newBrand;
  }

  static async getBrandNames() {
    const brands = await prisma.brand.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
    return brands;
  }

  static async updateBrand(
    id: number,
    data: {
      name?: string;
      description?: string;
      logo?: string;
      banner?: string;
      isActive?: boolean;
      slug?: string;
    }
  ) {
    // To be implemented
    return prisma.brand.update({
      where: { id },
      data,
    });
  }
}
