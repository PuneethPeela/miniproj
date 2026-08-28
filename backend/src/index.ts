import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

import prisma from "./lib/prisma";
import { setIo } from "./lib/socket";
import { errorHandler } from "./middleware/error.middleware";
import authRoutes from "./routes/auth.routes";
import menuRoutes from "./routes/menu.routes";
import orderRoutes from "./routes/order.routes";
import queueRoutes from "./routes/queue.routes";

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
const PORT = Number(process.env.PORT) || 3000;

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

setIo(io);

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/queue", queueRoutes);

app.use(errorHandler);

io.on("connection", (socket) => {
  console.log(`[ws] connected: ${socket.id}`);

  socket.on("join:order", (orderId: string) => {
    const room = `order:${orderId}`;
    socket.join(room);
    console.log(`[ws] ${socket.id} joined ${room}`);
  });

  socket.on("leave:order", (orderId: string) => {
    const room = `order:${orderId}`;
    socket.leave(room);
    console.log(`[ws] ${socket.id} left ${room}`);
  });

  socket.on("join:kitchen", () => {
    socket.join("kitchen:live");
    console.log(`[ws] ${socket.id} joined kitchen:live`);
  });

  socket.on("join:queue", () => {
    socket.join("queue:public");
    console.log(`[ws] ${socket.id} joined queue:public`);
  });

  socket.on("disconnect", () => {
    console.log(`[ws] disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { app, io, httpServer };
