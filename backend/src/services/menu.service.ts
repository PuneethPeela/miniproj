import prisma from "../lib/prisma";
import { AppError } from "../middleware/error.middleware";

export const getAllItems = async () => {
  return prisma.menuItem.findMany({
    where: { available: true },
    orderBy: { category: "asc" },
  });
};

export const getItemById = async (id: string) => {
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) {
    throw new AppError("Menu item not found", 404);
  }
  return item;
};

export const createItem = async (data: {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  quantityAvailable?: number;
  avgPrepSeconds?: number;
}) => {
  return prisma.menuItem.create({ data });
};

export const updateItem = async (
  id: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    available: boolean;
    quantityAvailable: number;
    avgPrepSeconds: number;
  }>
) => {
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) {
    throw new AppError("Menu item not found", 404);
  }

  return prisma.menuItem.update({ where: { id }, data });
};

export const deleteItem = async (id: string) => {
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) {
    throw new AppError("Menu item not found", 404);
  }

  return prisma.menuItem.update({
    where: { id },
    data: { available: false },
  });
};
