import type { ParsedCsv } from "../types/csv.types.js";
import { chat } from "../services/llm.service.js";
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
} from "../pompts/crm-mapping.prompt.js";

class CrmMappingService {
  async map(parsedCsv: ParsedCsv) {
    const userPrompt = buildUserPrompt(parsedCsv);

    const response = await chat([
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ]);

    return response;
  }
}

export const crmMappingService = new CrmMappingService();