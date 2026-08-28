import { Router } from "express";
import * as stockRequestController from "../controllers/stock-request.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize("KITCHEN_STAFF"),
  validate([
    { field: "menuItemId", label: "Menu Item ID", required: true, type: "string" },
    { field: "quantity", label: "Quantity", required: true, type: "number" },
  ]),
  stockRequestController.createRequest
);

router.get("/pending", authenticate, authorize("MANAGER"), stockRequestController.getPendingRequests);

router.get("/mine", authenticate, authorize("KITCHEN_STAFF"), stockRequestController.getMyRequests);

router.put("/:id/approve", authenticate, authorize("MANAGER"), stockRequestController.approveRequest);

router.put("/:id/reject", authenticate, authorize("MANAGER"), stockRequestController.rejectRequest);

export default router;
