import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.post(
  "/register",
  validate([
    { field: "name", label: "Name", required: true, type: "string", minLength: 2 },
    { field: "email", label: "Email", required: true, type: "string" },
    { field: "password", label: "Password", required: true, type: "string", minLength: 6 },
    { field: "role", label: "Role", required: true, type: "string" },
  ]),
  authController.register
);

router.post(
  "/login",
  validate([
    { field: "email", label: "Email", required: true, type: "string" },
    { field: "password", label: "Password", required: true, type: "string" },
  ]),
  authController.login
);

router.get("/profile", authenticate, authController.getProfile);

export default router;
