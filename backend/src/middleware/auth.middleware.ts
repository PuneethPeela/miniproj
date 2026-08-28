import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";
import { AppError } from "./error.middleware";
import prisma from "../lib/prisma";

const JWT_SECRET = (process.env.JWT_SECRET || "smart-canteen-secret-key") as string;

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", 401);
    }

    const token = authHeader.split(" ")[1] as string;
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as {
      id: string;
      email: string;
      role: string;
      name: string;
    };

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      throw new AppError("User not found", 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError("Invalid token", 401));
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Not authenticated", 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError("Not authorized", 403));
      return;
    }

    next();
  };
};
