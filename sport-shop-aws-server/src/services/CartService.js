import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { findVariant, getVariantId } from "../utils/cartUtils.js";

class CartService {
  static async getCart(userId) {
    let cart = await Cart.findOne({ user_id: userId });

    if (!cart) {
      return { items: [], subtotal: 0, total: 0, messages: [] };
    }

    let cartChanged = false;
    let messages = [];

    const productIds = cart.items.map((item) => item.product_id);
    const products = await Product.find({ _id: { $in: productIds } }).lean();

    const validItems = [];

    for (const item of cart.items) {
      const product = products.find(
        (p) => p._id.toString() === item.product_id.toString()
      );

      if (!product || !product.is_active) {
        cartChanged = true;
        messages.push(
          `Sản phẩm "${item.product_name_snapshot}" đã ngừng kinh doanh và được xóa khỏi giỏ.`
        );
        continue;
      }

      const variant = findVariant(product, item.variant_id);

      if (!variant) {
        cartChanged = true;
        messages.push(
          `Phiên bản "${item.variant_snapshot.color_name} - ${item.variant_snapshot.size_name}" của sản phẩm "${item.product_name_snapshot}" không còn tồn tại.`
        );
        continue;
      }

      if (variant.stock_quantity < item.quantity) {
        cartChanged = true;
        item.quantity = variant.stock_quantity;
        messages.push(
          `Số lượng sản phẩm "${item.product_name_snapshot}" đã được điều chỉnh do tồn kho không đủ.`
        );
        if (item.quantity === 0) continue;
      }

      const currentPrice = variant.price || product.base_price;
      if (currentPrice !== item.base_price_snapshot) {
        cartChanged = true;
        messages.push(
          `Giá sản phẩm "${item.product_name_snapshot}" đã thay đổi.`
        );
        item.base_price_snapshot = currentPrice;
        item.final_price_snapshot = currentPrice;
      }

      validItems.push(item);
    }

    if (cartChanged) {
      cart.items = validItems;
      await cart.save();
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.final_price_snapshot * item.quantity,
      0
    );

    // Enrich items
    const responseItems = cart.items.map((item) => {
      const product = products.find(
        (p) => p._id.toString() === item.product_id.toString()
      );
      const variant = product ? findVariant(product, item.variant_id) : null;

      return {
        ...item.toObject(),
        current_stock: variant ? variant.stock_quantity : 0,
      };
    });

    return {
      _id: cart._id,
      items: responseItems,
      subtotal,
      total: subtotal,
      messages,
    };
  }

  static async getCartCount(userId) {
    const cart = await Cart.findOne({ user_id: userId }).select(
      "items.quantity"
    );
    return cart ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  }

  static async addToCart(userId, { product_id, variant_id, quantity }) {
    const product = await Product.findOne({
      _id: product_id,
      is_active: true,
    }).populate("brand");

    if (!product) {
      throw new Error("Sản phẩm không tồn tại");
    }

    const variant = findVariant(product, variant_id);

    if (!variant) {
      throw new Error("Phiên bản sản phẩm không tồn tại");
    }

    if (variant.stock_quantity < quantity) {
      throw new Error(`Chỉ còn ${variant.stock_quantity} sản phẩm trong kho`);
    }

    const idToStore = getVariantId(variant);

    let cart = await Cart.findOne({ user_id: userId });
    if (!cart) {
      cart = new Cart({ user_id: userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.variant_id.toString() === idToStore
    );

    const price = variant.price || product.base_price;

    if (existingItemIndex > -1) {
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (newQuantity > variant.stock_quantity) {
        throw new Error("Số lượng vượt quá tồn kho");
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      let imageUrl = product.main_image_url;
      const mainImageObj =
        product.images.find((img) => img.is_main) || product.images[0];
      if (mainImageObj) imageUrl = mainImageObj.url;

      cart.items.push({
        product_id: product._id,
        variant_id: idToStore,
        quantity: quantity,
        product_name_snapshot: product.name,
        variant_snapshot: {
          sku: variant.sku,
          color_name: variant.color.name,
          size_name: variant.size.name,
          image_url: imageUrl,
          brand_name: product.brand.name,
        },
        base_price_snapshot: price,
        final_price_snapshot: price,
      });
    }

    await cart.save();
    return cart;
  }

  static async updateCartItem(userId, variant_id, quantity) {
    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) throw new Error("Giỏ hàng trống");

    const itemIndex = cart.items.findIndex(
      (item) => item.variant_id.toString() === variant_id.toString()
    );

    if (itemIndex === -1) {
      throw new Error("Sản phẩm không có trong giỏ");
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      const item = cart.items[itemIndex];
      const product = await Product.findById(item.product_id);
      const variant = findVariant(product, variant_id);

      if (variant.stock_quantity < quantity) {
        throw new Error(`Kho chỉ còn ${variant.stock_quantity} sản phẩm`);
      }

      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.final_price_snapshot * item.quantity,
      0
    );

    return { items: cart.items, subtotal };
  }

  static async removeCartItem(userId, variant_id) {
    const cart = await Cart.findOne({ user_id: userId });
    if (!cart) throw new Error("Giỏ hàng trống");

    cart.items = cart.items.filter(
      (item) => item.variant_id.toString() !== variant_id.toString()
    );

    await cart.save();

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.final_price_snapshot * item.quantity,
      0
    );

    return { items: cart.items, subtotal };
  }
}

export default CartService;
