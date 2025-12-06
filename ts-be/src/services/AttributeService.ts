import { prisma } from "@/lib/prisma.js";

export class AttributeService {
  static async getAllAttributes() {
    return await prisma.attribute.findMany({});
  }

  static async createAttribute(name: string, code: string) {
    return await prisma.attribute.create({
      data: { name, code },
    });
  }

  static async createAttributeValues(attributeId: number, value: string) {
    return await prisma.attributeValue.create({
      data: {
        attributeId,
        value,
      },
    });
  }

  static async getAttributeValuesByAttributeId(attributeId: number) {
    const values = await prisma.attributeValue.findMany({
      where: { attributeId },
    });
    // Chỉ trả về mảng string value
    return values.map((v) => v.value);
  }
  static async getAttributesWithValues(code?: string) {
    const where = code
      ? {
          code: {
            in: code.split(","), // Lấy các bản ghi có code nằm trong ['material', 'neckline']
          },
        }
      : {}; // Nếu không có code thì lấy hết

    const attributes = await prisma.attribute.findMany({
      where,
      include: {
        values: {},
      },
      orderBy: {
        name: "asc",
      },
    });
    return attributes.map((attr) => ({
      id: attr.id,
      name: attr.name,
      code: attr.code,
      values: attr.values.map((val) => val.value),
    }));
  }

  static async deleteAllAttributes() {
    return await prisma.attribute.deleteMany({});
  }

  static async deleteAttribute(attributeId: number) {
    return await prisma.attribute.delete({
      where: { id: attributeId },
    });
  }
}
