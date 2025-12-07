import { prisma } from "../lib/prisma.js";

export class SportService {
  static async getAllSports() {
    // return await prisma.sport.findMany({
    //   orderBy: {
    //     name: "asc",
    //   },
    // });
    return await prisma.sport.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    // return await prisma.sport.deleteMany({
    //   where: {
    //     isActive: false,
    //   },
    // });
  }

  static async createSport(name: string, slug?: string) {
    if (!slug) {
      slug = name.toLocaleLowerCase().replace(/\s+/g, "-");
    }
    return await prisma.sport.create({
      data: {
        name,
        slug,
      },
    });
  }

  static async getSportNames() {
    const sports = await prisma.sport.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
    return sports;
  }
}
