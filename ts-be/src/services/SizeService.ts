import { prisma } from "../lib/prisma.js";
import { SizeChartType } from "../../generated/prisma/enums.js";

export class SizeService {
  static async getAllSizes() {
    return prisma.size.findMany();
  }

  static async getSizeByChartType(chartType: SizeChartType) {
    return prisma.size.findMany({
      where: {
        chartType: chartType,
      },
    });
  }

  static async createSize(data: {
    name: string;
    chartType: SizeChartType;
    sortOrder?: number;
  }) {
    const existName = await prisma.size.findFirst({
      where: {
        name: data.name,
        chartType: data.chartType,
      },
    });
    if (existName) {
      throw new Error("Size with this name and chartType already exists");
    }
    return prisma.size.create({
      data,
    });
  }

  static async deleteAllSizes() {
    return prisma.size.deleteMany();
  }
}
