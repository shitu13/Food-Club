import { Router } from "express";
import authRoutes from "./auth.routes.js";
import dishRoutes from "./dish.routes.js";
import menuSectionRoutes from "./menuSection.routes.js";
import statsRoutes from "./stats.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/menu-sections", menuSectionRoutes);
router.use("/dishes", dishRoutes);
router.use("/stats", statsRoutes);

export default router;
