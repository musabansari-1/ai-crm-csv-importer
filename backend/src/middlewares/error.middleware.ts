import type { ErrorRequestHandler } from "express";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(env.NODE_ENV === "development" && { stack: error.stack }),
  });
};