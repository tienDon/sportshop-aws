import { prisma } from "../lib/prisma.js";

export class AudienceService {
  static async getAllAudiences() {
    return prisma.audience.findMany();
  }

  static async getAudienceById(id: number) {
    return prisma.audience.findUnique({
      where: { id },
    });
  }

  static async createAudience(name: string, slug: string) {
    const existingAudience = await prisma.audience.findUnique({
      where: { name, slug },
    });
    if (existingAudience) {
      throw new Error("Audience with the same name or slug already exists");
    }
    return prisma.audience.create({
      data: { name, slug },
    });
  }

  static async updateAudience(id: number, name?: string, slug?: string) {
    return prisma.audience.update({
      where: { id },
      data: { name, slug },
    });
  }

  static async deleteAudience(id: number) {
    return prisma.audience.delete({
      where: { id },
    });
  }
}
