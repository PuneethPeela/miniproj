import { Server } from "socket.io";

let io: Server;

export const setIo = (socketIo: Server): void => {
  io = socketIo;
};

export const getIo = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

export const emitOrderUpdate = (
  orderId: string,
  status: string,
  order: Record<string, unknown>
): void => {
  getIo().to(`order:${orderId}`).emit("order:update", { orderId, status, order });
  getIo().to("kitchen:live").emit("order:update", { orderId, status, order });
};

export const emitKitchenUpdate = (order: Record<string, unknown>): void => {
  getIo().to("kitchen:live").emit("kitchen:update", order);
};

export const emitQueueUpdate = (queueStatus: Record<string, unknown>): void => {
  getIo().to("queue:public").emit("queue:update", queueStatus);
};
