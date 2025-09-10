// routes/health.routes.js
import {Router} from "express";
import { healthCheck } from "../controllers/health.controller.js";

const router = Router();

router.route.get("/health", healthCheck);

export default router;
