import { Router } from "express";
import * as menuController from "../controllers/menu.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.get("/", menuController.getAllItems);
router.get("/:id", menuController.getItemById);

router.post(
  "/",
  authenticate,
  authorize("KITCHEN_STAFF"),
  validate([
    { field: "name", label: "Name", required: true, type: "string" },
    { field: "price", label: "Price", required: true, type: "number" },
    { field: "category", label: "Category", required: true, type: "string" },
  ]),
  menuController.createItem
);

router.put(
  "/:id",
  authenticate,
  authorize("KITCHEN_STAFF"),
  menuController.updateItem
);

router.delete(
  "/:id",
  authenticate,
  authorize("KITCHEN_STAFF"),
  menuController.deleteItem
);

export default router;
