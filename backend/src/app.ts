import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

import { logger } from "./config/logger.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

app.use(
  pinoHttp({
    logger,
  }),
);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

export default app;
