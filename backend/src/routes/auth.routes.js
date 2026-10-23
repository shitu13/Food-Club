import { Router } from "express";
import { changePassword, login, me, updateProfile } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { loginLimiter } from "../middleware/rateLimiters.js";
import { validate } from "../middleware/validate.js";
import { changePasswordSchema, loginSchema, updateProfileSchema } from "../validators/auth.validator.js";

const router = Router();

router.post("/login", loginLimiter, validate(loginSchema), login);
router.get("/me", protect, me);
router.patch("/me", protect, validate(updateProfileSchema), updateProfile);
router.patch("/password", protect, validate(changePasswordSchema), changePassword);

export default router;
