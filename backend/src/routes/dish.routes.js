import { Router } from "express";
import { createDish, deleteDish, getDish, listDishes, updateDish } from "../controllers/dish.controller.js";
import { ROLES } from "../constants/roles.js";
import { authorize, optionalAuth, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createDishSchema, dishIdSchema, listDishesSchema, updateDishSchema } from "../validators/dish.validator.js";

const router = Router();

// Public: the website's menu pages read from these.
router.get("/", optionalAuth, validate(listDishesSchema), listDishes);
router.get("/:id", optionalAuth, validate(dishIdSchema), getDish);

// The super admin and managers can change the menu.
router.use(protect, authorize(ROLES.SUPER_ADMIN, ROLES.MANAGER));

router.post("/", validate(createDishSchema), createDish);
router.patch("/:id", validate(updateDishSchema), updateDish);
router.delete("/:id", validate(dishIdSchema), deleteDish);

export default router;
