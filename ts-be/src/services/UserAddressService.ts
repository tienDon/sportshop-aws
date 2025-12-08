import { prisma } from "../lib/prisma.js";

interface CreateAddressDTO {
  address_detail: string;
  is_default?: boolean;
}

interface UpdateAddressDTO {
  address_detail?: string;
  is_default?: boolean;
}

export class UserAddressService {
  static async getAddresses(userId: number) {
    return await prisma.userAddress.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });
  }

  static async createAddress(userId: number, data: CreateAddressDTO) {
    return await prisma.$transaction(async (tx) => {
      if (data.is_default) {
        await tx.userAddress.updateMany({
          where: { user_id: userId, is_default: true },
          data: { is_default: false },
        });
      }

      // If this is the first address, make it default automatically
      const count = await tx.userAddress.count({ where: { user_id: userId } });
      const isDefault = count === 0 ? true : data.is_default || false;

      return await tx.userAddress.create({
        data: {
          user_id: userId,
          address_detail: data.address_detail,
          is_default: isDefault,
        },
      });
    });
  }

  static async updateAddress(
    userId: number,
    addressId: number,
    data: UpdateAddressDTO
  ) {
    return await prisma.$transaction(async (tx) => {
      const address = await tx.userAddress.findUnique({
        where: { id: addressId },
      });

      if (!address || address.user_id !== userId) {
        throw new Error("Address not found");
      }

      if (data.is_default) {
        await tx.userAddress.updateMany({
          where: {
            user_id: userId,
            is_default: true,
            id: { not: addressId },
          },
          data: { is_default: false },
        });
      }

      return await tx.userAddress.update({
        where: { id: addressId },
        data: {
          address_detail: data.address_detail,
          is_default: data.is_default,
        },
      });
    });
  }

  static async deleteAddress(userId: number, addressId: number) {
    const address = await prisma.userAddress.findUnique({
      where: { id: addressId },
    });

    if (!address || address.user_id !== userId) {
      throw new Error("Address not found");
    }

    return await prisma.userAddress.delete({
      where: { id: addressId },
    });
  }
}
