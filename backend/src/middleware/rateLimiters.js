import rateLimit from "express-rate-limit";
import ApiError from "../utils/ApiError.js";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const onLimit = (message) => (_req, _res, next) => next(new ApiError(429, message));

export const apiLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: onLimit("Too many requests. Please try again later."),
});

// Only failed attempts count, so normal logins are never blocked.
export const loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: onLimit("Too many failed login attempts. Please try again in 15 minutes."),
});
