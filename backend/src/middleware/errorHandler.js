import mongoose from "mongoose";
import { env } from "../config/env.js";
import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

const DUPLICATE_MESSAGES = {
  email: "A user with this email already exists.",
};

function normalize(error) {
  if (error instanceof ApiError) return error;

  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map((item) => ({ field: item.path, message: item.message }));
    return ApiError.validation(errors);
  }

  if (error instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid value for "${error.path}".`);
  }

  if (error?.code === 11000) {
    const field = Object.keys(error.keyPattern ?? {})[0] ?? "value";
    const message = DUPLICATE_MESSAGES[field] ?? `A record with this ${field} already exists.`;
    return ApiError.conflict(message, [{ field, message }]);
  }

  if (error?.type === "entity.parse.failed") return ApiError.badRequest("Request body is not valid JSON.");
  if (error?.type === "entity.too.large") return new ApiError(413, "Request body is too large.");

  const message = env.isProduction ? "Something went wrong on our side. Please try again later." : error?.message;
  return new ApiError(500, message || "Internal server error.");
}

// eslint-disable-next-line no-unused-vars
export default function errorHandler(error, req, res, _next) {
  const apiError = normalize(error);

  if (apiError.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl}`, error);
  }

  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    ...(apiError.errors && { errors: apiError.errors }),
    ...(env.isDevelopment && apiError.statusCode >= 500 && { stack: error?.stack }),
  });
}
