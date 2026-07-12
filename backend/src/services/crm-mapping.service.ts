import { env } from "../config/env.js";
import { chat } from "./llm.service.js";
import { chunkArray } from "../utils/chunk.util.js";
import type { ParsedCsv } from "../types/csv.types.js";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompts/crm-mapping.prompt.js";

class CrmMappingService {
  async map(parsedCsv: ParsedCsv) {
    const batches = chunkArray(parsedCsv.rows, env.AI_BATCH_SIZE);

    const records: unknown[] = [];
    const skipped: unknown[] = [];

    for (const batchRows of batches) {
      const userPrompt = buildUserPrompt({
        headers: parsedCsv.headers,
        rows: batchRows,
      });

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

      const result = JSON.parse(response);

      records.push(...result.records);
      skipped.push(...result.skipped);
    }

    return {
      records,
      skipped,
    };
  }
}

export const crmMappingService = new CrmMappingService();