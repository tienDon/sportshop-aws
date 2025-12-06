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
}
