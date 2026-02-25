import { Router } from "express";
import * as authController from "../controllers/auth.controller";

const router = Router();

router.post("/auth/signups", authController.createSignup);
router.post("/auth/signups/:id/attempt", authController.attemptSignup);

export { router as authRoutes };
