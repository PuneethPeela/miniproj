import prisma from "../lib/prisma";
import { AppError } from "../middleware/error.middleware";
import { emitOrderUpdate, emitKitchenUpdate } from "../lib/socket";

export const createOrder = async (
  userId: string,
  items: { menuItemId: string; quantity: number }[]
) => {
  if (!items || items.length === 0) {
    throw new AppError("Order must contain at least one item", 400);
  }

  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: items.map((i) => i.menuItemId) },
      available: true,
    },
  });

  if (menuItems.length !== items.length) {
    throw new AppError("One or more menu items are unavailable", 400);
  }

  const totalAmount = items.reduce((sum, item) => {
    const menuItem = menuItems.find((m) => m.id === item.menuItemId)!;
    return sum + menuItem.price * item.quantity;
  }, 0);

  const lastOrder = await prisma.order.findFirst({
    orderBy: { tokenNumber: "desc" },
  });
  const tokenNumber = (lastOrder?.tokenNumber ?? 0) + 1;

  const maxPrepTime = Math.max(
    ...menuItems.map((m) => {
      const orderItem = items.find((i) => i.menuItemId === m.id)!;
      return m.prepTime * orderItem.quantity;
    })
  );

  const estimatedAt = new Date(Date.now() + maxPrepTime * 60 * 1000);

  const order = await prisma.order.create({
    data: {
      userId,
      tokenNumber,
      totalAmount,
      estimatedAt,
      items: {
        create: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      items: { include: { menuItem: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  await updateQueueStatus();

  try {
    emitKitchenUpdate(order as unknown as Record<string, unknown>);
  } catch {
    // Socket may not be initialized yet
  }

  return order;
};

export const getOrderById = async (id: string, userId?: string) => {
  const where: Record<string, unknown> = { id };
  if (userId) {
    where.userId = userId;
  }

  const order = await prisma.order.findFirst({
    where,
    include: {
      items: { include: { menuItem: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return order;
};

export const getUserOrders = async (userId: string) => {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { menuItem: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const updateOrderStatus = async (id: string, status: string) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: { status: status as "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "PICKED_UP" | "CANCELLED" },
    include: {
      items: { include: { menuItem: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  await updateQueueStatus();

  try {
    emitOrderUpdate(id, status, updatedOrder as unknown as Record<string, unknown>);
  } catch {
    // Socket may not be initialized yet
  }

  return updatedOrder;
};

export const getAllActiveOrders = async () => {
  return prisma.order.findMany({
    where: {
      status: { notIn: ["PICKED_UP", "CANCELLED"] },
    },
    include: {
      items: { include: { menuItem: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });
};

const updateQueueStatus = async () => {
  const activeOrders = await prisma.order.count({
    where: {
      status: { notIn: ["PICKED_UP", "CANCELLED"] },
    },
  });

  const currentOrder = await prisma.order.findFirst({
    where: {
      status: { notIn: ["PICKED_UP", "CANCELLED"] },
    },
    orderBy: { tokenNumber: "asc" },
  });

  const estimatedWait = activeOrders * 5;

  const existingQueue = await prisma.queueStatus.findFirst();

  if (existingQueue) {
    await prisma.queueStatus.update({
      where: { id: existingQueue.id },
      data: {
        currentToken: currentOrder?.tokenNumber ?? 0,
        estimatedWait,
        activeOrders,
      },
    });
  } else {
    await prisma.queueStatus.create({
      data: {
        currentToken: currentOrder?.tokenNumber ?? 0,
        estimatedWait,
        activeOrders,
      },
    });
  }
};
