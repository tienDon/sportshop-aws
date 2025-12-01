import type { User } from "./User";

// Kiểu dữ liệu xác định người dùng (email hoặc phone)
export type Identifier = { type: "email" | "phone"; value: string };

// Request OTP Response
export interface RequestOtpResponse {
  success: boolean;
  message: string;
  otpToken?: string;
  expiresAt?: string;
  error?: string;
}

// Verify OTP Response
export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  user?: User;
  accessToken?: string;
  error?: string;
}

// Resend OTP Response
export interface ResendOtpResponse {
  success: boolean;
  message: string;
  otpToken?: string;
  expiresAt?: string;
  error?: string;
}

// Refresh Token Response
export interface RefreshTokenResponse {
  success: boolean;
  accessToken?: string;
  message?: string;
  error?: string;
}

// User Info Response
export interface UserInfoResponse {
  success: boolean;
  user?: User;
  message?: string;
  error?: string;
}
