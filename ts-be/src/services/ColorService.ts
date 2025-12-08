import { prisma } from "../lib/prisma.js";

export class ColorService {
  static async getAllColors() {
    return await prisma.color.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  static async createColor(name: string, hexCode: string) {
    return await prisma.color.create({
      data: {
        name,
        hexCode,
      },
    });
  }

  static async updateColor(id: string, name: string, hexCode: string) {
    return await prisma.color.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        hexCode,
      },
    });
  }

  static async deleteColor(id: string) {
    return await prisma.color.delete({
      where: {
        id: Number(id),
      },
    });
  }
}
