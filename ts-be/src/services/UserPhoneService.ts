import { prisma } from "../lib/prisma.js";

interface CreatePhoneDTO {
  phone_number: string;
  is_default?: boolean;
}

interface UpdatePhoneDTO {
  phone_number?: string;
  is_default?: boolean;
}

export class UserPhoneService {
  static async getPhones(userId: number) {
    return await prisma.userPhone.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });
  }

  static async createPhone(userId: number, data: CreatePhoneDTO) {
    return await prisma.$transaction(async (tx) => {
      // Check if phone number already exists (globally unique in schema)
      const existing = await tx.userPhone.findUnique({
        where: { phone_number: data.phone_number },
      });
      if (existing) {
        throw new Error("Phone number already exists");
      }

      if (data.is_default) {
        await tx.userPhone.updateMany({
          where: { user_id: userId, is_default: true },
          data: { is_default: false },
        });
      }

      // If this is the first phone, make it default automatically
      const count = await tx.userPhone.count({ where: { user_id: userId } });
      const isDefault = count === 0 ? true : data.is_default || false;

      return await tx.userPhone.create({
        data: {
          user_id: userId,
          phone_number: data.phone_number,
          is_default: isDefault,
        },
      });
    });
  }

  static async updatePhone(
    userId: number,
    phoneId: number,
    data: UpdatePhoneDTO
  ) {
    return await prisma.$transaction(async (tx) => {
      const phone = await tx.userPhone.findUnique({
        where: { id: phoneId },
      });

      if (!phone || phone.user_id !== userId) {
        throw new Error("Phone not found");
      }

      if (data.phone_number && data.phone_number !== phone.phone_number) {
        const existing = await tx.userPhone.findUnique({
          where: { phone_number: data.phone_number },
        });
        if (existing) {
          throw new Error("Phone number already exists");
        }
      }

      if (data.is_default) {
        await tx.userPhone.updateMany({
          where: { user_id: userId, is_default: true },
          data: { is_default: false },
        });
      }

      return await tx.userPhone.update({
        where: { id: phoneId },
        data: {
          phone_number: data.phone_number,
          is_default: data.is_default,
        },
      });
    });
  }

  static async deletePhone(userId: number, phoneId: number) {
    const phone = await prisma.userPhone.findUnique({
      where: { id: phoneId },
    });

    if (!phone || phone.user_id !== userId) {
      throw new Error("Phone not found");
    }

    return await prisma.userPhone.delete({
      where: { id: phoneId },
    });
  }
}
