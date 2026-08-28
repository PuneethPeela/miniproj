import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import * as authService from "../services/auth.service";

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const result = await authService.register(name, email, password, role);

    // Store password hash in a note (the schema doesn't have a password field)
    // In production, you'd add a passwordHash field to the User model
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
