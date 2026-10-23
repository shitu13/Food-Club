import { ROLES } from "../constants/roles.js";
import Dish from "../models/Dish.js";
import MenuSection from "../models/MenuSection.js";
import User from "../models/User.js";

export async function getStats(_req, res) {
  const [dishTotal, dishAvailable, sectionTotal, sectionActive, managerTotal, managerActive] = await Promise.all([
    Dish.countDocuments(),
    Dish.countDocuments({ isAvailable: true }),
    MenuSection.countDocuments(),
    MenuSection.countDocuments({ isActive: true }),
    User.countDocuments({ role: ROLES.MANAGER }),
    User.countDocuments({ role: ROLES.MANAGER, isActive: true }),
  ]);

  res.json({
    success: true,
    data: {
      dishes: { total: dishTotal, available: dishAvailable },
      menuSections: { total: sectionTotal, active: sectionActive },
      managers: { total: managerTotal, active: managerActive },
    },
  });
}
