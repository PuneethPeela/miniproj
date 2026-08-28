import { Router } from "express";
import * as orderController from "../controllers/order.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  validate([
    { field: "items", label: "Items", required: true, type: "array" },
  ]),
  orderController.createOrder
);

router.get("/", authenticate, orderController.getUserOrders);

router.get(
  "/active/all",
  authenticate,
  authorize("KITCHEN_STAFF"),
  orderController.getAllActiveOrders
);

router.get("/:id", authenticate, orderController.getOrderById);

router.put(
  "/:id/status",
  authenticate,
  authorize("KITCHEN_STAFF"),
  validate([
    { field: "status", label: "Status", required: true, type: "string" },
  ]),
  orderController.updateOrderStatus
);

export default router;
