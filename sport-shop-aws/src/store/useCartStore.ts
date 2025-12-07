import { create } from "zustand";
import { cartApi, CartResponse } from "@/services/cartApi";
import { toast } from "sonner"; // Assuming sonner is used, or we can use another toast lib

interface CartState {
  cart: CartResponse | null;
  isLoading: boolean;
  isAdding: boolean;
  
  fetchCart: () => Promise<void>;
  addToCart: (variantId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,
  isAdding: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await cartApi.getCart();
      if (res.success) {
        set({ cart: res.data });
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (variantId: number, quantity: number) => {
    set({ isAdding: true });
    try {
      const res = await cartApi.addToCart(variantId, quantity);
      if (res.success) {
        set({ cart: res.data });
        toast.success("Đã thêm vào giỏ hàng");
      }
    } catch (error: any) {
      console.error("Failed to add to cart:", error);
      toast.error(error.response?.data?.message || "Không thể thêm vào giỏ hàng");
    } finally {
      set({ isAdding: false });
    }
  },

  updateQuantity: async (itemId: number, quantity: number) => {
    // Optimistic update could be implemented here, but for now let's wait for API
    try {
      const res = await cartApi.updateCartItem(itemId, quantity);
      if (res.success) {
        set({ cart: res.data });
      }
    } catch (error: any) {
      console.error("Failed to update quantity:", error);
      toast.error(error.response?.data?.message || "Lỗi cập nhật số lượng");
    }
  },

  removeItem: async (itemId: number) => {
    try {
      const res = await cartApi.removeCartItem(itemId);
      if (res.success) {
        set({ cart: res.data });
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
      }
    } catch (error: any) {
      console.error("Failed to remove item:", error);
      toast.error("Không thể xóa sản phẩm");
    }
  },
}));
