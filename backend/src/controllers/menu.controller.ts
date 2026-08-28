import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import * as menuService from "../services/menu.service";

export const getAllItems = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const items = await menuService.getAllItems();
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const item = await menuService.getItemById(id);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const createItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const item = await menuService.createItem(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const item = await menuService.updateItem(id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    await menuService.deleteItem(id);
    res.json({ success: true, message: "Item removed from menu" });
  } catch (error) {
    next(error);
  }
};
