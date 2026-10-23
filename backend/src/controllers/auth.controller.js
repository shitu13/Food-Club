import bcrypt from "bcryptjs";
import { env } from "../config/env.js";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { signToken } from "../utils/token.js";

// Compared when the email is unknown so response time does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", env.BCRYPT_ROUNDS);

export async function login(req, res) {
  const { email, password } = req.validated.body;

  const user = await User.findOne({ email }).select("+password");
  const passwordMatches = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);

  if (!user || !passwordMatches) {
    throw ApiError.unauthorized("Invalid email or password.");
  }
  if (!user.isActive) {
    throw ApiError.forbidden("This account has been deactivated. Please contact the super admin.");
  }

  user.lastLoginAt = new Date();
  await User.updateOne({ _id: user._id }, { lastLoginAt: user.lastLoginAt });

  res.json({ success: true, data: { token: signToken(user), user } });
}

export function me(req, res) {
  res.json({ success: true, data: { user: req.user } });
}

export async function updateProfile(req, res) {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: req.validated.body },
    { returnDocument: "after", runValidators: true }
  );

  res.json({ success: true, message: "Your details were updated.", data: { user } });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.validated.body;

  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest("Current password is incorrect.", [
      { field: "currentPassword", message: "Current password is incorrect." },
    ]);
  }

  user.password = newPassword;
  await user.save();

  // A new token is returned because the old one stops working once the password changes.
  res.json({ success: true, message: "Password updated.", data: { token: signToken(user) } });
}
