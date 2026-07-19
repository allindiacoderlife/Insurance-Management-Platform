import { Router } from "express";
import {
  forgotPassword,
  getMe,
  loginUser,
  registerUser,
  resendOtp,
  resetPassword,
  verifyEmailOtp,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendOtpSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../validations/auth.validation.js";

const router = Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/verify-otp", validate(verifyOtpSchema), verifyEmailOtp);
router.post("/resend-otp", validate(resendOtpSchema), resendOtp);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.get("/me", authenticate, getMe);

export default router;
