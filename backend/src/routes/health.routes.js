import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", (_req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(databaseReady ? 200 : 503).json({
    success: databaseReady,
    data: {
      status: databaseReady ? "ok" : "degraded",
      database: databaseReady ? "connected" : "disconnected",
      uptime: Math.round(process.uptime()),
    },
  });
});

export default router;
