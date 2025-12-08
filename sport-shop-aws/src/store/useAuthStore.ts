import type { AuthState } from "@/types/store";
import type {
  RequestOtpResponse,
  VerifyOtpResponse,
  ResendOtpResponse,
} from "@/types/Auth";
import { persist } from "zustand/middleware";
import { create } from "zustand";
import api from "@/lib/axios";
import { toast } from "sonner";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      loading: false,

      // OTP state
      currentIdentifier: null,
      otpToken: null,
      otpSent: false,
      otpExpiresAt: null,

      setAccessToken: (token: string) => set({ accessToken: token }),
      setUser: (user) => set({ user }),
      setOtpSent: (otpSent: boolean) => set({ otpSent }),
      setOtpToken: (token: string | null) => set({ otpToken: token }),

      clearState: () => {
        set({
          accessToken: null,
          user: null,
          currentIdentifier: null,
          otpToken: null,
          otpSent: false,
          otpExpiresAt: null,
          loading: false,
        });

        try {
          localStorage.removeItem("auth-storage");
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("auth")) {
              localStorage.removeItem(key);
            }
          });
        } catch (error) {
          console.error("Error clearing localStorage:", error);
        }
      },

      // Request OTP cho cả signup và signin
      requestOtp: async (
        identifier: string,
        full_name?: string
      ): Promise<RequestOtpResponse> => {
        set({ loading: true });

        try {
          const payload: { identifier: string; full_name?: string } = {
            identifier,
          };
          if (full_name) {
            payload.full_name = full_name;
          }

          const res = await api.post("/api/auth/request-otp", payload);
          const data: RequestOtpResponse = res.data;

          if (data.success && data.otpToken) {
            set({
              currentIdentifier: identifier,
              otpToken: data.otpToken,
              otpSent: true,
              otpExpiresAt: data.expiresAt || null,
            });

            const actionType = full_name ? "Đăng ký" : "Đăng nhập";
            toast.success(`${actionType} thành công! Vui lòng kiểm tra OTP.`);
          }

          return data;
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Có lỗi xảy ra";
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Verify OTP
      verifyOtp: async (otpCode: string): Promise<VerifyOtpResponse> => {
        const { otpToken } = get();

        if (!otpToken) {
          throw new Error("Không tìm thấy OTP token");
        }

        set({ loading: true });

        try {
          const payload = {
            otpToken,
            otpCode,
          };

          const res = await api.post("/api/auth/verify-otp", payload);
          const data: VerifyOtpResponse = res.data;

          if (data.success && data.accessToken && data.user) {
            set({
              accessToken: data.accessToken,
              user: data.user,
              otpSent: false,
              otpToken: null,
              currentIdentifier: null,
              otpExpiresAt: null,
            });

            toast.success("Xác thực thành công!");
          }
          console.log(data);

          return data;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Xác thực OTP thất bại";
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Resend OTP
      resendOtp: async (): Promise<ResendOtpResponse> => {
        const { otpToken } = get();

        if (!otpToken) {
          throw new Error("Không tìm thấy OTP token");
        }

        set({ loading: true });

        try {
          const res = await api.post("/api/auth/resend-otp", { otpToken });
          const data: ResendOtpResponse = res.data;

          if (data.success && data.otpToken) {
            set({
              otpToken: data.otpToken,
              otpExpiresAt: data.expiresAt || null,
            });

            toast.success("Đã gửi lại mã OTP!");
          }

          return data;
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Không thể gửi lại OTP";
          toast.error(errorMessage);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Refresh access token
      refreshToken: async (): Promise<void> => {
        try {
          const res = await api.post("/api/auth/refresh-token");

          if (res.data.success && res.data.accessToken) {
            set({ accessToken: res.data.accessToken });
          } else {
            throw new Error("Refresh token failed");
          }
        } catch (error) {
          console.error("Refresh token error:", error);
          get().clearState();
          throw error;
        }
      },

      // Get current user info
      getCurrentUser: async (): Promise<void> => {
        try {
          const res = await api.get("/api/auth/me");

          if (res.data.success && res.data.user) {
            set({ user: res.data.user });
          }
        } catch (error: any) {
          console.error("Get current user error:", error);
          // Nếu là lỗi 401 hoặc 403, có thể token đã expired
          if (
            error?.response?.status === 401 ||
            error?.response?.status === 403
          ) {
            throw error; // Throw để initializeAuth có thể handle refresh
          }
          // Các lỗi khác (network, server), không throw
        }
      },

      // Logout
      logout: async (): Promise<void> => {
        try {
          await api.post("/api/auth/logout");
          toast.success("Đăng xuất thành công!");
        } catch (error) {
          console.error("Logout error:", error);
          // Vẫn clear state dù có lỗi
        } finally {
          get().clearState();
        }
      },

      // Initialize auth on app startup
      initializeAuth: async (): Promise<void> => {
        const { accessToken, user } = get();
        console.log("🔄 Initializing auth...", {
          hasToken: !!accessToken,
          hasUser: !!user,
        });

        // Nếu không có user hoặc token, thử refresh
        if (!accessToken || !user) {
          console.log("🔄 No access token or user, trying to refresh...");
          try {
            await get().refreshToken();
            // Nếu refresh thành công, lấy thông tin user
            await get().getCurrentUser();
            console.log("✅ Auth initialized successfully via refresh");
          } catch (error) {
            console.log("❌ Auth initialization failed, clearing state");
            get().clearState();
          }
        } else {
          // Nếu có token, verify bằng cách lấy thông tin user
          console.log("🔄 Verifying existing token...");
          try {
            await get().getCurrentUser();
            console.log("✅ Existing token verified");
          } catch (error) {
            console.log("❌ Token verification failed, trying refresh...");
            try {
              await get().refreshToken();
              await get().getCurrentUser();
              console.log("✅ Auth recovered via refresh");
            } catch (refreshError) {
              console.log("❌ Auth recovery failed, clearing state");
              get().clearState();
            }
          }
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    }
  )
);
