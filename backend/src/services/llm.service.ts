import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { env } from "../config/env.js";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
});

export async function chat(
  messages: ChatCompletionMessageParam[]
): Promise<string> {
  const response = await client.chat.completions.create({
    model: env.AI_MODEL,
    messages,
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned an empty response.");
  }

  return content;
}