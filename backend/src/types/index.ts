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
  MANAGER = "MANAGER",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PREPARING = "PREPARING",
  READY = "READY",
  PICKED_UP = "PICKED_UP",
  CANCELLED = "CANCELLED",
}

export enum QueueStage {
  WAITING = "WAITING",
  IN_KITCHEN = "IN_KITCHEN",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
}
