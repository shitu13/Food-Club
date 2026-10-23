import { Router } from "express";
import {
  createMenuSection,
  deleteMenuSection,
  listMenuSections,
  updateMenuSection,
} from "../controllers/menuSection.controller.js";
import { ROLES } from "../constants/roles.js";
import { authorize, optionalAuth, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createMenuSectionSchema,
  listMenuSectionsSchema,
  menuSectionIdSchema,
  updateMenuSectionSchema,
} from "../validators/menuSection.validator.js";

const router = Router();

// Public: the navbar's Menu dropdown reads this.
router.get("/", optionalAuth, validate(listMenuSectionsSchema), listMenuSections);

// The super admin and managers decide what appears under Menu.
router.use(protect, authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER));

router.post("/", validate(createMenuSectionSchema), createMenuSection);
router.patch("/:id", validate(updateMenuSectionSchema), updateMenuSection);
router.delete("/:id", validate(menuSectionIdSchema), deleteMenuSection);

export default router;
