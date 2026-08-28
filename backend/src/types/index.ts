import { Request } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export enum UserRole {
  STUDENT = "STUDENT",
  KITCHEN_STAFF = "KITCHEN_STAFF",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY = "READY",
  PICKED_UP = "PICKED_UP",
  CANCELLED = "CANCELLED",
}
