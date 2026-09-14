import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import * as authService from "../services/auth.service";
import * as googleAuthService from "../services/google-auth.service";
import * as otpService from "../services/otp.service";

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.register(name, email, password, role);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    res.json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const profile = await authService.getProfile(req.user.id);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// ── Google OAuth ──────────────────────────────────────────────────────────

export const googleLogin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({ success: false, error: "Google ID token is required" });
      return;
    }

    const result = await googleAuthService.authenticateWithGoogle(idToken);

    res.json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
        profileComplete: result.profileComplete,
        isNewUser: result.isNewUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const completeProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const { rollNumber } = req.body;
    if (!rollNumber) {
      res.status(400).json({ success: false, error: "Roll number is required" });
      return;
    }

    const profile = await googleAuthService.completeProfile(req.user.id, rollNumber);

    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

// ── Password Reset (OTP) ──────────────────────────────────────────────────

export const forgotPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, error: "Email is required" });
      return;
    }

    const result = await otpService.requestPasswordReset(email);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ success: false, error: "Email and OTP are required" });
      return;
    }

    const result = await otpService.verifyOTP(email, otp);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      res.status(400).json({
        success: false,
        error: "Reset token and new password are required",
      });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters",
      });
      return;
    }

    const result = await otpService.resetPassword(resetToken, newPassword);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
