import crypto from "crypto";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { AppError } from "../middleware/error.middleware";

const JWT_SECRET = (process.env.JWT_SECRET || "smart-canteen-secret-key") as string;
const JWT_EXPIRES_IN = "7d";

const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt as crypto.BinaryLike, 64).toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const [salt, hash] = stored.split(":");
  const hashToVerify = crypto.scryptSync(password, salt as crypto.BinaryLike, 64).toString("hex");
  return hash === hashToVerify;
};

const generateToken = (user: { id: string; email: string; role: string; name: string }): string => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const register = async (
  name: string,
  email: string,
  password: string,
  role: string
) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashedPassword,
      role: role as "STUDENT" | "KITCHEN_STAFF" | "MANAGER",
    },
  });

  const token = generateToken(user);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
};

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken(user);

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
};

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
