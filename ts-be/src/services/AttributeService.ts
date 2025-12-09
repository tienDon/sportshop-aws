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
    return values;
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
      values: attr.values,
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

  static async updateAttribute(
    attributeId: number,
    name?: string,
    code?: string
  ) {
    return await prisma.attribute.update({
      where: { id: attributeId },
      data: {
        ...(name && { name }),
        ...(code && { code }),
      },
    });
  }

  static async updateAttributeValue(
    valueId: number,
    value?: string,
    sortOrder?: number
  ) {
    return await prisma.attributeValue.update({
      where: { id: valueId },
      data: {
        ...(value !== undefined && { value }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });
  }

  static async deleteAttributeValue(valueId: number) {
    return await prisma.attributeValue.delete({
      where: { id: valueId },
    });
  }
}
