import { prisma } from "../lib/prisma.js";
import { OrderStatus } from "../../generated/prisma/enums.js";

interface CreateOrderDTO {
  userId: number;
  cartId: number;
  shippingAddressId: number;
  userPhoneId: number;
  note?: string;
}

export class OrderService {
  static async createOrder({
    userId,
    cartId,
    shippingAddressId,
    userPhoneId,
    note,
  }: CreateOrderDTO) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validate Cart
      const cart = await tx.cart.findUnique({
        where: { id: cartId },
        include: {
          items: {
            include: {
              product: true,
              variant: {
                include: {
                  color: true,
                  size: true,
                },
              },
            },
          },
        },
      });

      if (!cart || cart.userId !== userId) {
        throw new Error("Cart not found or does not belong to user");
      }

      if (cart.items.length === 0) {
        throw new Error("Cart is empty");
      }

      // 2. Validate Address
      const address = await tx.userAddress.findUnique({
        where: { id: shippingAddressId },
      });

      if (!address || address.user_id !== userId) {
        throw new Error("Invalid shipping address");
      }

      // 3. Validate Phone
      const phone = await tx.userPhone.findUnique({
        where: { id: userPhoneId },
      });

      if (!phone || phone.user_id !== userId) {
        throw new Error("Invalid phone number");
      }

      // 4. Get User for Name
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) throw new Error("User not found");

      // 5. Calculate Total
      let totalAmount = 0;
      const orderItemsData = cart.items.map((item) => {
        const price = item.variant.price || item.product.basePrice;
        const itemTotal = Number(price) * item.quantity;
        totalAmount += itemTotal;

        return {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: price,
          productNameSnapshot: item.product.name,
          variantSkuSnapshot: item.variant.sku || "",
          variantColorSnapshot: item.variant.color.name,
          variantSizeSnapshot: item.variant.size.name,
        };
      });

      // 6. Create Order
      const orderCode = `#ORD-${Date.now()}`; // Simple generation
      const order = await tx.order.create({
        data: {
          userId,
          orderCode,
          totalFinalAmount: totalAmount,
          receiverNameSnapshot: user.full_name,
          receiverPhoneSnapshot: phone.phone_number,
          shippingAddressSnapshot: address.address_detail,
          note,
          status: OrderStatus.CONFIRMED,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // 7. Clear Cart
      await tx.cartItem.deleteMany({
        where: { cartId },
      });

      return order;
    });
  }

  static async getOrders(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    const formattedOrders = orders.map((order) => ({
      orderId: order.id,
      orderCode: order.orderCode,
      orderDate: order.orderDate,
      status: order.status,
      totalFinalAmount: order.totalFinalAmount,
      receiverName: order.receiverNameSnapshot,
      shippingAddress: order.shippingAddressSnapshot,
      items: order.items.map((item) => ({
        quantity: item.quantity,
        price: item.price,
        productName: item.productNameSnapshot,
        variantDetails: `${item.variantColorSnapshot} / ${item.variantSizeSnapshot}`,
        mainImageUrl: item.product.mainImageUrl,
      })),
    }));

    return {
      orders: formattedOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getOrderById(orderId: number, userId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            variant: {
              include: {
                color: true,
                size: true,
              },
            },
          },
        },
      },
    });

    if (!order || order.userId !== userId) {
      return null;
    }

    return {
      orderId: order.id,
      orderCode: order.orderCode,
      orderDate: order.orderDate,
      status: order.status,
      totalFinalAmount: order.totalFinalAmount,
      receiverName: order.receiverNameSnapshot,
      shippingAddress: order.shippingAddressSnapshot,
      note: order.note,
      items: order.items.map((item) => ({
        quantity: item.quantity,
        price: item.price,
        productName: item.productNameSnapshot,
        variantDetails: `${item.variantColorSnapshot} / ${item.variantSizeSnapshot}`,
        mainImageUrl: item.product.mainImageUrl,
      })),
    };
  }
}
