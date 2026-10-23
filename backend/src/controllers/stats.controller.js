import { ROLES } from "../constants/roles.js";
import Dish from "../models/Dish.js";
import MenuSection from "../models/MenuSection.js";
import User from "../models/User.js";

// Managers see the menu numbers. The manager counts are only for the super admin.
export async function getStats(req, res) {
  const [dishTotal, dishAvailable, sectionTotal, sectionActive] = await Promise.all([
    Dish.countDocuments(),
    Dish.countDocuments({ isAvailable: true }),
    MenuSection.countDocuments(),
    MenuSection.countDocuments({ isActive: true }),
  ]);

  const data = {
    dishes: { total: dishTotal, available: dishAvailable },
    menuSections: { total: sectionTotal, active: sectionActive },
  };

  if (req.user.role === ROLES.SUPER_ADMIN) {
    const [managerTotal, managerActive] = await Promise.all([
      User.countDocuments({ role: ROLES.MANAGER }),
      User.countDocuments({ role: ROLES.MANAGER, isActive: true }),
    ]);
    data.managers = { total: managerTotal, active: managerActive };
  }

  res.json({ success: true, data });
}
