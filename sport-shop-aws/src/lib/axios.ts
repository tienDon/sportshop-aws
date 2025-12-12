import { useAuthStore } from "@/store/useAuthStore";
import axios from "axios";

const api = axios.create({
  baseURL:
    // import.meta.env.VITE_API_URL ||
    "https://api.donvt.me",
  withCredentials: true, // Quan trọng cho cookies
});

// Flag để tránh gọi refresh token nhiều lần cùng lúc (race condition)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Gắn access token vào header của mỗi request nếu có
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Tự động refresh token khi access token hết hạn
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Những API không cần check refresh
    if (
      originalRequest.url?.includes("/auth/request-otp") ||
      originalRequest.url?.includes("/auth/verify-otp") ||
      originalRequest.url?.includes("/auth/refresh-token") ||
      originalRequest.url?.includes("/auth/resend-otp")
    ) {
      return Promise.reject(error);
    }

    // Kiểm tra nếu là 401 và chưa retry quá nhiều lần
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Nếu đang refresh token, thêm request vào queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      console.log("Access token expired, attempting to refresh...");
      console.log(
        "Refresh token request - cookies will be sent automatically with withCredentials: true"
      );

      try {
        // Refresh token API sẽ tự động sử dụng refreshToken từ cookie (httpOnly)
        // Không cần gửi refreshToken trong body vì backend đọc từ cookie
        const res = await api.post("/api/auth/refresh-token");

        if (res.data.success && res.data.accessToken) {
          const accessToken = res.data.accessToken;

          // Cập nhật token trong store
          useAuthStore.getState().setAccessToken(accessToken);

          // Cập nhật sessionStorage (đồng bộ với useAuthStore.refreshToken)
          try {
            sessionStorage.setItem("token", accessToken);
          } catch (e) {
            console.error("Cannot write sessionStorage token:", e);
          }

          console.log("Token refreshed successfully");

          // Xử lý queue và retry request ban đầu
          processQueue(null, accessToken);
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

          return api(originalRequest);
        } else {
          throw new Error("Refresh token failed: Invalid response");
        }
      } catch (refreshError: any) {
        console.error("Refresh token failed:", refreshError);

        // Xử lý queue với error
        processQueue(refreshError, null);

        // Clear auth state
        useAuthStore.getState().clearState();

        // Redirect to login page nếu cần
        // window.location.href = "/login";

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
