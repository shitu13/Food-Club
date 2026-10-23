import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { verifyToken } from "../utils/token.js";

const SESSION_ENDED = "Your session has expired. Please log in again.";

function extractToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

// The user is always re-read from the database, so deactivating an account
// or changing a password (which bumps tokenVersion) ends existing sessions immediately.
async function resolveUser(token) {
  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw ApiError.unauthorized(SESSION_ENDED);
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive || user.tokenVersion !== payload.ver) {
    throw ApiError.unauthorized(SESSION_ENDED);
  }
  return user;
}

export async function protect(req, _res, next) {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized("Please log in to continue.");
  req.user = await resolveUser(token);
  next();
}

// For public routes that show more to logged-in staff. A bad token is treated as anonymous.
export async function optionalAuth(req, _res, next) {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = await resolveUser(token);
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
    }
  }
  next();
}

export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden());
    }
    return next();
  };
