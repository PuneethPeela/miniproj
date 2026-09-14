import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

// ── Email/Password Auth ───────────────────────────────────────────────────

router.post(
  "/register",
  validate([
    { field: "name", label: "Name", required: true, type: "string", minLength: 2 },
    { field: "email", label: "Email", required: true, type: "string" },
    { field: "password", label: "Password", required: true, type: "string", minLength: 6 },
    { field: "role", label: "Role", required: true, type: "string" },
  ]),
  authController.register
);

router.post(
  "/login",
  validate([
    { field: "email", label: "Email", required: true, type: "string" },
    { field: "password", label: "Password", required: true, type: "string" },
  ]),
  authController.login
);

router.get("/profile", authenticate, authController.getProfile);

// ── Google OAuth ──────────────────────────────────────────────────────────

router.post("/google", authController.googleLogin);

router.post(
  "/complete-profile",
  authenticate,
  validate([
    { field: "rollNumber", label: "Roll number", required: true, type: "string" },
  ]),
  authController.completeProfile
);

// ── Password Reset (OTP) ──────────────────────────────────────────────────

router.post("/forgot-password", authController.forgotPassword);

router.post("/verify-otp", authController.verifyOTP);

router.post("/reset-password", authController.resetPassword);

export default router;
