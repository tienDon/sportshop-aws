import { prisma } from "../lib/prisma.js";
import { SizeChartType } from "../../generated/prisma/enums.js";

export class SizeService {
  static async getAllSizes(page?: number, limit?: number) {
    if (page && limit) {
      const skip = (page - 1) * limit;
      const [sizes, total] = await Promise.all([
        prisma.size.findMany({
          skip,
          take: limit,
          orderBy: { sortOrder: "asc" },
        }),
        prisma.size.count(),
      ]);
      return {
        sizes,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    }
    return prisma.size.findMany({ orderBy: { sortOrder: "asc" } });
  }

  static async getSizeByChartType(
    chartType: SizeChartType,
    page?: number,
    limit?: number
  ) {
    if (page && limit) {
      const skip = (page - 1) * limit;
      const [sizes, total] = await Promise.all([
        prisma.size.findMany({
          where: { chartType },
          skip,
          take: limit,
          orderBy: { sortOrder: "asc" },
        }),
        prisma.size.count({ where: { chartType } }),
      ]);
      return {
        sizes,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    }
    return prisma.size.findMany({
      where: {
        chartType: chartType,
      },
      orderBy: { sortOrder: "asc" },
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

  static async deleteSize(id: number) {
    return prisma.size.delete({
      where: {
        id,
      },
    });
  }

  static async updateSize(
    id: number,
    data: { name?: string; chartType?: SizeChartType; sortOrder?: number }
  ) {
    return prisma.size.update({
      where: {
        id,
      },
      data,
    });
  }
}
