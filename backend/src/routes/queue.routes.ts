import { Router } from "express";
import * as queueController from "../controllers/queue.controller";

const router = Router();

router.get("/", queueController.getQueueStatus);

export default router;
