import pino from "pino";
import { env } from "./env.js";

const isDevelopment = env.NODE_ENV === "development";

export const logger = pino({
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      }
    : undefined,
});