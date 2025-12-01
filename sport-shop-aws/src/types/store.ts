import type { User } from "./User";
import type {
  Identifier,
  RequestOtpResponse,
  VerifyOtpResponse,
  ResendOtpResponse,
} from "./Auth";

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;

  // OTP state
  currentIdentifier: string | null; // Đổi thành string để lưu identifier value
  otpToken: string | null; // Lưu otpToken từ backend
  otpSent: boolean;
  otpExpiresAt: string | null;

  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  setOtpSent: (otpSent: boolean) => void;
  setOtpToken: (token: string | null) => void;
  clearState: () => void;

  // Auth actions
  requestOtp: (
    identifier: string,
    name?: string
  ) => Promise<RequestOtpResponse>;
  verifyOtp: (otpCode: string) => Promise<VerifyOtpResponse>;
  resendOtp: () => Promise<ResendOtpResponse>;
  refreshToken: () => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}
