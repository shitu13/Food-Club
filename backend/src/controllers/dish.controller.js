import { STAFF_ROLES } from "../constants/roles.js";
import Dish from "../models/Dish.js";
import MenuSection from "../models/MenuSection.js";
import ApiError from "../utils/ApiError.js";
import { escapeRegex, flattenObject, getSkip, paginationMeta } from "../utils/query.js";

const SORTS = {
  newest: { createdAt: -1 },
  name: { "name.en": 1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
};

const isStaff = (req) => Boolean(req.user && STAFF_ROLES.includes(req.user.role));

// Every selected menu item must exist, otherwise a dish could point at something that was never created.
async function assertSectionsExist(ids) {
  if (!ids) return;
  const found = await MenuSection.countDocuments({ _id: { $in: ids } });
  if (found !== ids.length) {
    throw ApiError.validation([{ field: "sections", message: "One of the selected menu items no longer exists." }]);
  }
}

// Visitors only see public fields of dishes that are on the menu.
const visibleFields = (req) => (isStaff(req) ? "" : "-createdBy");

export async function listDishes(req, res) {
  const { page, limit, search, category, section, isAvailable, sort } = req.validated.query;

  const filter = {};
  if (category) filter.category = category;
  if (section) filter.sections = section;
  if (!isStaff(req)) {
    filter.isAvailable = true;
  } else if (isAvailable !== undefined) {
    filter.isAvailable = isAvailable;
  }
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ "name.en": pattern }, { "name.bn": pattern }];
  }

  const [dishes, total] = await Promise.all([
    Dish.find(filter)
      .select(visibleFields(req))
      .sort({ ...SORTS[sort], _id: -1 })
      .skip(getSkip(page, limit))
      .limit(limit),
    Dish.countDocuments(filter),
  ]);

  res.json({ success: true, data: { dishes }, meta: paginationMeta({ page, limit, total }) });
}

export async function getDish(req, res) {
  const dish = await Dish.findById(req.validated.params.id).select(visibleFields(req));
  if (!dish || (!dish.isAvailable && !isStaff(req))) throw ApiError.notFound("Dish not found.");

  res.json({ success: true, data: { dish } });
}

export async function createDish(req, res) {
  await assertSectionsExist(req.validated.body.sections);
  const dish = await Dish.create({ ...req.validated.body, createdBy: req.user.id });
  res.status(201).json({ success: true, message: "Dish added.", data: { dish } });
}

export async function updateDish(req, res) {
  await assertSectionsExist(req.validated.body.sections);
  const dish = await Dish.findByIdAndUpdate(
    req.validated.params.id,
    { $set: flattenObject(req.validated.body) },
    { returnDocument: "after", runValidators: true }
  );
  if (!dish) throw ApiError.notFound("Dish not found.");

  res.json({ success: true, message: "Dish updated.", data: { dish } });
}

export async function deleteDish(req, res) {
  const dish = await Dish.findByIdAndDelete(req.validated.params.id);
  if (!dish) throw ApiError.notFound("Dish not found.");

  res.json({ success: true, message: "Dish deleted." });
}
