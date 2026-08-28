import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import * as orderService from "../services/order.service";

export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const { items } = req.body;
    const order = await orderService.createOrder(req.user.id, items);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const id = req.params.id as string;
    const order = await orderService.getOrderById(id, req.user.id);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const orders = await orderService.getUserOrders(req.user.id);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    const id = req.params.id as string;
    const order = await orderService.updateOrderStatus(id, status);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const getAllActiveOrders = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await orderService.getAllActiveOrders();
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

export const pickUpOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }
    const id = req.params.id as string;
    const order = await orderService.pickUpOrder(id, req.user.id);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }
    const id = req.params.id as string;
    const order = await orderService.cancelOrder(id, req.user.id);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
