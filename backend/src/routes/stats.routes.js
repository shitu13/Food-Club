import { Router } from "express";
import { getStats } from "../controllers/stats.controller.js";
import { ROLES } from "../constants/roles.js";
import { authorize, protect } from "../middleware/auth.js";

const router = Router();

router.get("/", protect, authorize(ROLES.SUPER_ADMIN), getStats);

export default router;
