import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import * as stockRequestService from "../services/stock-request.service";

export const createRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const { menuItemId, quantity, reason } = req.body;
    const request = await stockRequestService.createRequest(
      menuItemId,
      req.user.id,
      quantity,
      reason
    );
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const getPendingRequests = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const requests = await stockRequestService.getPendingRequests();
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const getMyRequests = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const requests = await stockRequestService.getMyRequests(req.user.id);
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

export const approveRequest = async (
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
    const request = await stockRequestService.approveRequest(id, req.user.id);
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};

export const rejectRequest = async (
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
    const request = await stockRequestService.rejectRequest(id, req.user.id);
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
};
