import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import errorHandler from "./middleware/errorHandler.js";
import notFound from "./middleware/notFound.js";
import { apiLimiter } from "./middleware/rateLimiters.js";
import healthRoutes from "./routes/health.routes.js";
import routes from "./routes/index.js";
import ApiError from "./utils/ApiError.js";

const app = express();

app.set("trust proxy", env.TRUST_PROXY);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (curl, Postman, server to server) are allowed.
      if (!origin || env.clientOrigins.includes(origin)) return callback(null, true);
      return callback(ApiError.forbidden("This origin is not allowed by CORS."));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  })
);
if (env.NODE_ENV !== "test") app.use(morgan(env.isProduction ? "combined" : "dev"));
app.use(express.json({ limit: "10kb" }));

app.get("/", (_req, res) => {
  res.json({ success: true, data: { name: "Food Club API", version: "1.0.0" } });
});

// Health check sits before the rate limiter so uptime monitors are never blocked.
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1", apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
