import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";

import { logger } from "./config/logger.js";
import { env } from "./config/env.js";

import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.CLIENT_URL,
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

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
