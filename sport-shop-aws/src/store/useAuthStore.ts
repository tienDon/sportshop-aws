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
          // ⭐ THÊM 2 DÒNG NÀY
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("userId");

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
        fullName?: string
      ): Promise<RequestOtpResponse> => {
        set({ loading: true });

        try {
          const payload: { identifier: string; name?: string } = {
            identifier,
          };
          if (fullName) {
            payload.name = fullName;
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

            const actionType = fullName ? "Đăng ký" : "Đăng nhập";
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

            // ⭐ GHI CHO WEBSOCKET XÀI
            try {
              // tuỳ BE trả field id nào, mình bắt lần lượt
              const userAny: any = data.user;
              const userId =
                userAny.id ?? userAny.userId ?? userAny.user_id ?? null;

              sessionStorage.setItem("token", data.accessToken);
              if (userId != null) {
                sessionStorage.setItem("userId", String(userId));
              }
            } catch (e) {
              console.error("Cannot write sessionStorage for chat:", e);
            }

            // Lưu ý: refreshToken được backend tự động set vào cookie (httpOnly)
            // Không cần lưu refreshToken vào localStorage/sessionStorage
            // Cookie sẽ tự động được gửi kèm với mọi request nhờ withCredentials: true
            console.log("✅ RefreshToken should be set in cookie by backend (httpOnly)");
            console.log("📦 Verify OTP response:", {
              hasAccessToken: !!data.accessToken,
              hasUser: !!data.user,
              hasRefreshToken: !!(data as any).refreshToken,
              userId: (data.user as any).id ?? (data.user as any).userId ?? (data.user as any).user_id,
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
      // Lưu ý: refreshToken được lưu trong cookie (httpOnly) bởi backend
      // Không cần gửi refreshToken trong body, axios sẽ tự động gửi cookie với withCredentials: true
      refreshToken: async (): Promise<void> => {
        try {
          console.log("🔄 Refreshing access token using refreshToken from cookie...");
          
          // API refresh-token sẽ tự động đọc refreshToken từ cookie (httpOnly)
          // Không cần gửi refreshToken trong body
          const res = await api.post("/api/auth/refresh-token");

          if (res.data.success && res.data.accessToken) {
            const newToken = res.data.accessToken;
            console.log("✅ Access token refreshed successfully");
            
            set({ accessToken: newToken });

            // ⭐ Cập nhật luôn token cho WebSocket và đồng bộ với user
            try {
              sessionStorage.setItem("token", newToken);
              
              // Đồng bộ userId nếu có user trong store
              const { user } = get();
              if (user) {
                const userAny: any = user;
                const userId = userAny.id ?? userAny.userId ?? userAny.user_id ?? null;
                if (userId != null) {
                  sessionStorage.setItem("userId", String(userId));
                }
              }
            } catch (e) {
              console.error("Cannot write sessionStorage token:", e);
            }
          } else {
            throw new Error("Refresh token failed: Invalid response");
          }
        } catch (error: any) {
          console.error("❌ Refresh token error:", error);
          const errorStatus = error?.response?.status;
          const errorMessage = error?.response?.data?.message || error?.message;
          
          // Chỉ clear state nếu refresh token thực sự hết hạn (401/403)
          if (errorStatus === 401 || errorStatus === 403) {
            console.log("❌ Refresh token expired or invalid, clearing auth state");
            get().clearState();
          } else {
            console.log("❌ Refresh token failed with status:", errorStatus, "Message:", errorMessage);
          }
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
        // Tránh gọi nhiều lần cùng lúc
        const state = get();
        if (state.loading) {
          console.log("🔄 Auth initialization already in progress, skipping...");
          return;
        }

        set({ loading: true });
        const { accessToken, user } = state;
        
        console.log("🔄 Initializing auth...", {
          hasToken: !!accessToken,
          hasUser: !!user,
        });

        try {
          // Trường hợp 1: Có cả user và token → verify token trước, chỉ refresh nếu cần
          if (user && accessToken) {
            console.log("🔄 User and token found, verifying token...");
            try {
              // Thử verify token hiện tại trước (nhanh hơn)
              await get().getCurrentUser();
              console.log("✅ Existing token is valid");
              
              // Đồng bộ sessionStorage với store
              try {
                const userAny: any = user;
                const userId = userAny.id ?? userAny.userId ?? userAny.user_id ?? null;
                if (accessToken) {
                  sessionStorage.setItem("token", accessToken);
                }
                if (userId != null) {
                  sessionStorage.setItem("userId", String(userId));
                }
                console.log("✅ SessionStorage synced with store");
              } catch (e) {
                console.error("Cannot sync sessionStorage:", e);
              }
            } catch (error: any) {
              // Token không hợp lệ, thử refresh (sử dụng refreshToken từ cookie)
              console.log("❌ Token verification failed, trying refresh using cookie...");
              const errorStatus = error?.response?.status;
              if (errorStatus === 401 || errorStatus === 403) {
                try {
                  // Refresh token sẽ tự động sử dụng refreshToken từ cookie
                  await get().refreshToken();
                  await get().getCurrentUser();
                  console.log("✅ Auth recovered via refresh token from cookie");
                } catch (refreshError) {
                  console.log("❌ Auth recovery failed, refreshToken may be expired");
                  get().clearState();
                }
              } else {
                // Lỗi khác (network, server), không clear state
                console.log("❌ Network/server error, keeping state");
              }
            }
          }
          // Trường hợp 2: Có user nhưng không có token → refresh (sử dụng refreshToken từ cookie)
          else if (user && !accessToken) {
            console.log("🔄 User found but no token, refreshing using cookie...");
            try {
              // Refresh token sẽ tự động sử dụng refreshToken từ cookie (httpOnly)
              await get().refreshToken();
              await get().getCurrentUser();
              console.log("✅ Auth initialized successfully via refresh token from cookie");
            } catch (error) {
              console.log("❌ Token refresh failed, refreshToken may be expired");
              get().clearState();
            }
          }
          // Trường hợp 3: Có token nhưng không có user → verify và lấy user
          else if (accessToken && !user) {
            console.log("🔄 Token found but no user, verifying and fetching user...");
            try {
              await get().getCurrentUser();
              console.log("✅ Token verified, user info retrieved");
            } catch (error: any) {
              // Token không hợp lệ, thử refresh (sử dụng refreshToken từ cookie)
              if (error?.response?.status === 401 || error?.response?.status === 403) {
                console.log("❌ Token invalid, trying refresh using cookie...");
                try {
                  // Refresh token sẽ tự động sử dụng refreshToken từ cookie
                  await get().refreshToken();
                  await get().getCurrentUser();
                  console.log("✅ Auth recovered via refresh token from cookie");
                } catch (refreshError) {
                  console.log("❌ Auth recovery failed, refreshToken may be expired");
                  get().clearState();
                }
              } else {
                // Lỗi khác (network, server), không clear state
                console.log("❌ Network/server error, keeping state");
              }
            }
          }
          // Trường hợp 4: Không có cả user và token → thử refresh (sử dụng refreshToken từ cookie)
          else {
            console.log("🔄 No token or user, trying to refresh using cookie...");
            try {
              // Refresh token sẽ tự động sử dụng refreshToken từ cookie (httpOnly)
              // Nếu có refreshToken trong cookie, sẽ lấy được accessToken và user
              await get().refreshToken();
              await get().getCurrentUser();
              console.log("✅ Auth initialized successfully via refresh token from cookie");
            } catch (error) {
              console.log("❌ Auth initialization failed, no valid refreshToken in cookie");
              // Không clear state nếu không có gì để clear
            }
          }
        } finally {
          set({ loading: false });
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
