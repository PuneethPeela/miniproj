import prisma from "../lib/prisma";

export const getStats = async () => {
  const activeOrders = await prisma.order.count({
    where: { status: { notIn: ["PICKED_UP", "CANCELLED"] } },
  });

  const queueStatus = await prisma.queueStatus.findFirst();
  const avgWaitTime = queueStatus?.estimatedWait ?? 0;

  const queueLength = await prisma.queueEntry.count({
    where: { stage: { notIn: ["READY_FOR_PICKUP"] } },
  });

  const totalMenuItems = await prisma.menuItem.count({
    where: { available: true },
  });

  const lowStockItems = await prisma.menuItem.count({
    where: { available: true, quantityAvailable: { lt: 10 } },
  });

  const kitchenLoad = totalMenuItems > 0
    ? Math.round(((activeOrders + lowStockItems) / Math.max(totalMenuItems, 1)) * 100)
    : 0;

  return {
    activeOrders,
    avgWaitTime,
    queueLength,
    kitchenLoad: Math.min(kitchenLoad, 100),
  };
};

export const getBatchAggregator = async (windowMinutes: number) => {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

  const ordersInWindow = await prisma.order.findMany({
    where: {
      createdAt: { gte: windowStart },
      status: { notIn: ["CANCELLED"] },
    },
    include: {
      items: { include: { menuItem: true } },
    },
  });

  const aggregated: Record<string, { name: string; count: number; totalUnits: number }> = {};

  for (const order of ordersInWindow) {
    for (const item of order.items) {
      const key = item.menuItemId;
      if (!aggregated[key]) {
        aggregated[key] = {
          name: item.menuItem?.name ?? key,
          count: 0,
          totalUnits: 0,
        };
      }
      aggregated[key]!.count += 1;
      aggregated[key]!.totalUnits += item.quantity;
    }
  }

  const items = Object.entries(aggregated).map(([menuItemId, data]) => ({
    menuItemId,
    ...data,
  }));

  return {
    windowMinutes,
    ordersInWindow: ordersInWindow.length,
    uniqueDishTypes: items.length,
    items,
  };
};
