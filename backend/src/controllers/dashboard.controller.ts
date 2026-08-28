import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import * as dashboardService from "../services/dashboard.service";

export const getStats = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await dashboardService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

export const getBatchAggregator = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const windowMinutes = Number(req.query.window) || 5;
    const data = await dashboardService.getBatchAggregator(windowMinutes);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
