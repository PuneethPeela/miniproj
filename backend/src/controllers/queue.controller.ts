import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import * as queueService from "../services/queue.service";

export const getQueueStatus = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queue = await queueService.getQueueStatus();
    res.json({ success: true, data: queue });
  } catch (error) {
    next(error);
  }
};

export const updateQueue = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const queue = await queueService.updateQueue();
    res.json({ success: true, data: queue });
  } catch (error) {
    next(error);
  }
};
