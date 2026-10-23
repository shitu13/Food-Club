import { Router } from "express";
import {
  createManager,
  deleteManager,
  listManagers,
  resetManagerPassword,
  updateManager,
} from "../controllers/user.controller.js";
import { ROLES } from "../constants/roles.js";
import { authorize, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createManagerSchema,
  listManagersSchema,
  managerIdSchema,
  resetPasswordSchema,
  updateManagerSchema,
} from "../validators/user.validator.js";

const router = Router();

// Only the super admin can manage managers.
router.use(protect, authorize(ROLES.SUPER_ADMIN));

router.get("/", validate(listManagersSchema), listManagers);
router.post("/", validate(createManagerSchema), createManager);
router.patch("/:id", validate(updateManagerSchema), updateManager);
router.patch("/:id/password", validate(resetPasswordSchema), resetManagerPassword);
router.delete("/:id", validate(managerIdSchema), deleteManager);

export default router;
