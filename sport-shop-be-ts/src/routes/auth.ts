import { Router } from "express";
import * as AuthController from "../controllers/AuthController";
import { authenticateToken } from "../middlewares/auth";

const router = Router();

router.post("/request-otp", AuthController.requestOtp);
router.post("/verify-otp", AuthController.verifyOtp);
router.post("/resend-otp", AuthController.resendOTP);
router.post("/check-otp-status", AuthController.checkOTPStatus);
router.post("/refresh-token", AuthController.refreshToken);
router.post("/logout", AuthController.logout);
router.get("/me", authenticateToken, AuthController.getMe);

export default router;
