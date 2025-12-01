import express from "express";
import AuthController from "../controllers/AuthController.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route POST /api/auth/request-otp
 * @desc Request OTP cho signup hoặc signin
 * @access Public
 * @body { identifier: "email/phone", name?: "string" }
 */
router.post("/request-otp", AuthController.requestOTP);

/**
 * @route POST /api/auth/verify-otp
 * @desc Verify OTP và đăng nhập
 * @access Public
 * @body { userId, identifier, otpCode }
 */
router.post("/verify-otp", AuthController.verifyOTP);

/**
 * @route POST /api/auth/resend-otp
 * @desc Gửi lại OTP
 * @access Public
 * @body { userId, identifier }
 */
router.post("/resend-otp", AuthController.resendOTP);

/**
 * @route POST /api/auth/check-otp-status
 * @desc Kiểm tra trạng thái OTP
 * @access Public
 * @body { userId, identifier }
 */
router.post("/check-otp-status", AuthController.checkOTPStatus);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token
 * @access Public (cần refresh token trong cookie)
 */
router.post("/refresh-token", AuthController.refreshToken);

/**
 * @route POST /api/auth/logout
 * @desc Đăng xuất
 * @access Private
 */
router.post("/logout", authenticateToken, AuthController.logout);

/**
 * @route POST /api/auth/logout-all
 * @desc Đăng xuất khỏi tất cả thiết bị
 * @access Private
 */
router.post("/logout-all", authenticateToken, AuthController.logoutAll);

/**
 * @route GET /api/auth/me
 * @desc Lấy thông tin user hiện tại
 * @access Private
 */
router.get("/me", authenticateToken, AuthController.getMe);

export default router;
