import { ROLES } from "../constants/roles.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { escapeRegex, getSkip, paginationMeta } from "../utils/query.js";

const managerFilter = (id) => ({ _id: id, role: ROLES.MANAGER });

export async function listManagers(req, res) {
  const { page, limit, search, isActive } = req.validated.query;

  const filter = { role: ROLES.MANAGER };
  if (isActive !== undefined) filter.isActive = isActive;
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1, _id: -1 }).skip(getSkip(page, limit)).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, data: { users }, meta: paginationMeta({ page, limit, total }) });
}

export async function createManager(req, res) {
  // The role is fixed here. It is never taken from the request body.
  const user = await User.create({ ...req.validated.body, role: ROLES.MANAGER, createdBy: req.user.id });
  res.status(201).json({ success: true, message: "Manager created.", data: { user } });
}

export async function updateManager(req, res) {
  const user = await User.findOneAndUpdate(
    managerFilter(req.validated.params.id),
    { $set: req.validated.body },
    { returnDocument: "after", runValidators: true }
  );
  if (!user) throw ApiError.notFound("Manager not found.");

  res.json({ success: true, message: "Manager updated.", data: { user } });
}

export async function resetManagerPassword(req, res) {
  const user = await User.findOne(managerFilter(req.validated.params.id)).select("+password");
  if (!user) throw ApiError.notFound("Manager not found.");

  user.password = req.validated.body.password;
  await user.save();

  res.json({ success: true, message: "Password reset. The manager's old sessions have been ended." });
}

export async function deleteManager(req, res) {
  const user = await User.findOneAndDelete(managerFilter(req.validated.params.id));
  if (!user) throw ApiError.notFound("Manager not found.");

  res.json({ success: true, message: "Manager deleted." });
}
