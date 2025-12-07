import { prisma } from "../lib/prisma.js";

type CartIdentity = { userId: number } | { sessionId: string };

export class CartService {
  private static cartInclude = {
    items: {
      include: {
        variant: {
          include: {
            color: true,
            size: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            mainImageUrl: true,
            brand: { select: { name: true } },
          },
        },
      },
      orderBy: { id: "desc" },
    },
  } as const;

  private static getCartWhereInput(identity: CartIdentity) {
    if ("userId" in identity) {
      return { userId: identity.userId };
    } else {
      return { userId: (identity as any).userId };
    }
  }

  private static transformCart(cart: any) {
    if (!cart) return null;

    const items = cart.items.map((item: any) => {
      const variantPrice = Number(item.variant.price || 0);
      return {
        itemId: item.id,
        quantity: item.quantity,
        isSelected: item.isSelected,
        product: {
          name: item.product.name,
          slug: item.product.slug,
          brandName: item.product.brand?.name || "",
          mainImageUrl: item.product.mainImageUrl,
        },
        variant: {
          variantId: item.variant.id,
          sku: item.variant.sku || "",
          price: variantPrice.toString(),
          stockQuantity: item.variant.stockQuantity,
          color: item.variant.color
            ? {
                name: item.variant.color.name,
                hexCode: item.variant.color.hexCode,
              }
            : null,
          size: item.variant.size ? { name: item.variant.size.name } : null,
          image:
            (item.variant.imageUrls as string[])?.[0] ||
            item.product.mainImageUrl,
        },
      };
    });

    const totalPrice = items.reduce((acc: number, item: any) => {
      if (item.isSelected) {
        return acc + Number(item.variant.price) * item.quantity;
      }
      return acc;
    }, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      totalItems: items.length,
      totalPrice: totalPrice.toString(),
      items: items,
    };
  }

  static async getCart(identity: CartIdentity) {
    const whereInput = this.getCartWhereInput(identity);

    let cart = await prisma.cart.findUnique({
      where: whereInput,
      include: this.cartInclude,
    });

    if (!cart) {
      // @ts-ignore
      cart = await prisma.cart.create({
        data: whereInput,
        include: this.cartInclude,
      });
    }

    return this.transformCart(cart);
  }

  static async addToCart({
    identity,
    variantId,
    quantity,
  }: {
    identity: CartIdentity;
    variantId: number;
    quantity: number;
  }) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) throw new Error("Variant not found");

    const whereInput = this.getCartWhereInput(identity);
    let cart = await prisma.cart.findUnique({ where: whereInput });

    if (!cart) {
      // @ts-ignore
      cart = await prisma.cart.create({ data: whereInput });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: variantId,
        },
      },
    });

    const currentQty = existingItem ? existingItem.quantity : 0;
    const newTotalQty = currentQty + quantity;

    if (newTotalQty > variant.stockQuantity) {
      throw new Error(
        `Không đủ hàng. Chỉ còn ${variant.stockQuantity} sản phẩm.`
      );
    }

    await prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: variantId,
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        cartId: cart.id,
        productId: variant.productId,
        variantId: variantId,
        quantity: quantity,
      },
    });

    return this.getCart(identity);
  }

  static async updateCartItem(
    identity: CartIdentity,
    cartItemId: number,
    quantity: number
  ) {
    const whereInput = this.getCartWhereInput(identity);
    const cart = await prisma.cart.findUnique({ where: whereInput });
    if (!cart) throw new Error("Cart not found");

    const item = await prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id },
      include: { variant: true },
    });

    if (!item) throw new Error("Item not found in cart");

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: cartItemId } });
    } else {
      if (quantity > item.variant.stockQuantity) {
        throw new Error(
          `Không đủ hàng. Chỉ còn ${item.variant.stockQuantity} sản phẩm.`
        );
      }

      await prisma.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });
    }

    return this.getCart(identity);
  }

  static async removeCartItem(identity: CartIdentity, cartItemId: number) {
    const whereInput = this.getCartWhereInput(identity);
    const cart = await prisma.cart.findUnique({ where: whereInput });

    if (!cart) throw new Error("Cart not found");

    const item = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cartId: cart.id,
      },
    });

    if (!item) throw new Error("Item not found");

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    return this.getCart(identity);
  }

  static async getCartItemCount(identity: CartIdentity) {
    const whereInput = this.getCartWhereInput(identity);
    const cart = await prisma.cart.findUnique({ where: whereInput });
    if (!cart) return 0;

    const itemCount = await prisma.cartItem.count({
      where: { cartId: cart.id },
    });
    return itemCount;
  }
}
