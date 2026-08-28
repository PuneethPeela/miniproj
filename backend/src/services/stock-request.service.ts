import prisma from "../lib/prisma";
import { AppError } from "../middleware/error.middleware";

export const createRequest = async (
  menuItemId: string,
  requestedBy: string,
  quantity: number,
  reason?: string
) => {
  const menuItem = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
  if (!menuItem) {
    throw new AppError("Menu item not found", 404);
  }

  return prisma.stockRequest.create({
    data: {
      menuItemId,
      requestedBy,
      quantity,
      reason,
    },
    include: {
      menuItem: true,
      requester: { select: { id: true, name: true, email: true } },
    },
  });
};

export const getPendingRequests = async () => {
  return prisma.stockRequest.findMany({
    where: { status: "PENDING" },
    include: {
      menuItem: true,
      requester: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const approveRequest = async (id: string, reviewedBy: string) => {
  const request = await prisma.stockRequest.findUnique({ where: { id } });
  if (!request) {
    throw new AppError("Stock request not found", 404);
  }
  if (request.status !== "PENDING") {
    throw new AppError("Request has already been reviewed", 400);
  }

  return prisma.$transaction(async (tx) => {
    await tx.menuItem.update({
      where: { id: request.menuItemId },
      data: { quantityAvailable: { increment: request.quantity } },
    });

    return tx.stockRequest.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedBy,
        reviewedAt: new Date(),
      },
      include: {
        menuItem: true,
        requester: { select: { id: true, name: true, email: true } },
        reviewer: { select: { id: true, name: true, email: true } },
      },
    });
  });
};

export const rejectRequest = async (id: string, reviewedBy: string) => {
  const request = await prisma.stockRequest.findUnique({ where: { id } });
  if (!request) {
    throw new AppError("Stock request not found", 404);
  }
  if (request.status !== "PENDING") {
    throw new AppError("Request has already been reviewed", 400);
  }

  return prisma.stockRequest.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewedBy,
      reviewedAt: new Date(),
    },
    include: {
      menuItem: true,
      requester: { select: { id: true, name: true, email: true } },
      reviewer: { select: { id: true, name: true, email: true } },
    },
  });
};

export const getMyRequests = async (requestedBy: string) => {
  return prisma.stockRequest.findMany({
    where: { requestedBy },
    include: {
      menuItem: true,
      reviewer: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};
