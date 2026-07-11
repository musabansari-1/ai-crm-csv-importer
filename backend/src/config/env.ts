import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PORT: z.coerce.number().int().positive().default(5000),

  OPENROUTER_API_KEY: z.string().min(1),
  
  AI_MODEL: z.string().min(1),

  CLIENT_URL: z.url(),
});

export const env = envSchema.parse(process.env);