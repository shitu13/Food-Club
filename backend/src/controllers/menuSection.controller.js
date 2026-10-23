import { STAFF_ROLES } from "../constants/roles.js";
import Dish from "../models/Dish.js";
import MenuSection from "../models/MenuSection.js";
import ApiError from "../utils/ApiError.js";
import { escapeRegex, flattenObject } from "../utils/query.js";
import { slugify } from "../utils/slug.js";

const MAX_SECTIONS = 100;

const isStaff = (req) => Boolean(req.user && STAFF_ROLES.includes(req.user.role));

async function uniqueSlug(text) {
  const base = slugify(text);
  let slug = base;
  for (let n = 2; await MenuSection.exists({ slug }); n += 1) slug = `${base}-${n}`;
  return slug;
}

// Public: the navbar, footer and menu pages read this. Visitors only get active items.
export async function listMenuSections(req, res) {
  const { search, isActive } = req.validated.query;
  const staff = isStaff(req);

  const filter = {};
  if (!staff) {
    filter.isActive = true;
  } else if (isActive !== undefined) {
    filter.isActive = isActive;
  }
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ "name.en": pattern }, { "name.bn": pattern }];
  }

  const sections = await MenuSection.find(filter)
    .select(staff ? "" : "-createdBy")
    .sort({ position: 1, "name.en": 1, _id: 1 })
    .limit(MAX_SECTIONS);

  // Staff also see how many dishes each item holds, so they know what a delete would affect.
  const menuSections = staff
    ? await Promise.all(
        sections.map(async (section) => ({
          ...section.toJSON(),
          dishCount: await Dish.countDocuments({ sections: section._id }),
        }))
      )
    : sections;

  res.json({ success: true, data: { menuSections } });
}

export async function createMenuSection(req, res) {
  const body = req.validated.body;

  let { position } = body;
  if (position === undefined) {
    const last = await MenuSection.findOne().sort({ position: -1 }).select("position");
    position = last ? last.position + 1 : 1;
  }

  const section = await MenuSection.create({
    ...body,
    position,
    slug: await uniqueSlug(body.name.en),
    createdBy: req.user.id,
  });

  res.status(201).json({ success: true, message: "Menu item added.", data: { menuSection: section } });
}

export async function updateMenuSection(req, res) {
  // The slug is not editable on purpose, so links to /menu/<slug> keep working after a rename.
  const section = await MenuSection.findByIdAndUpdate(
    req.validated.params.id,
    { $set: flattenObject(req.validated.body) },
    { returnDocument: "after", runValidators: true }
  );
  if (!section) throw ApiError.notFound("Menu item not found.");

  res.json({ success: true, message: "Menu item updated.", data: { menuSection: section } });
}

export async function deleteMenuSection(req, res) {
  const { id } = req.validated.params;

  const dishCount = await Dish.countDocuments({ sections: id });
  if (dishCount > 0) {
    throw ApiError.conflict(
      `This menu item still has ${dishCount} ${dishCount === 1 ? "dish" : "dishes"}. Move or delete them first, or hide the item instead.`
    );
  }

  const section = await MenuSection.findByIdAndDelete(id);
  if (!section) throw ApiError.notFound("Menu item not found.");

  res.json({ success: true, message: "Menu item deleted." });
}
