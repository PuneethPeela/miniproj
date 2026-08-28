import prisma from "../lib/prisma";
import { emitQueueUpdate } from "../lib/socket";

export const getQueueStatus = async () => {
  let queue = await prisma.queueStatus.findFirst();

  if (!queue) {
    queue = await prisma.queueStatus.create({
      data: {
        currentToken: 0,
        estimatedWait: 0,
        activeOrders: 0,
      },
    });
  }

  return queue;
};

export const updateQueue = async () => {
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

  let queue = await prisma.queueStatus.findFirst();

  if (queue) {
    queue = await prisma.queueStatus.update({
      where: { id: queue.id },
      data: {
        currentToken: currentOrder?.tokenNumber ?? 0,
        estimatedWait,
        activeOrders,
      },
    });
  } else {
    queue = await prisma.queueStatus.create({
      data: {
        currentToken: currentOrder?.tokenNumber ?? 0,
        estimatedWait,
        activeOrders,
      },
    });
  }

  try {
    emitQueueUpdate(queue as unknown as Record<string, unknown>);
  } catch {
    // Socket may not be initialized yet
  }

  return queue;
};
