import { env } from "../config/env.js";
import { chat } from "./llm.service.js";
import { chunkArray } from "../utils/chunk.util.js";
import type { ParsedCsv } from "../types/csv.types.js";
import type {
  CRMRecord,
  ImportResult,
  ImportStreamHandlers,
  SkippedRecord,
} from "../types/crm.types.js";
import {
  normalizeCRMRecord,
  normalizeSkippedRecord,
  parseLlmBatchJson,
} from "../utils/normalize-import.util.js";
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
} from "../prompts/crm-mapping.prompt.js";

class CrmMappingService {
  async map(parsedCsv: ParsedCsv): Promise<ImportResult> {
    const allRecords: CRMRecord[] = [];
    const allSkipped: SkippedRecord[] = [];

    await this.mapBatches(parsedCsv, {
      onBatch: (records) => {
        allRecords.push(...records);
      },
      onSkipped: (skipped) => {
        allSkipped.push(...skipped);
      },
      onComplete: () => {
        // assembled below
      },
    });

    return {
      records: allRecords,
      skipped: allSkipped,
      total_processed: allRecords.length + allSkipped.length,
    };
  }

  /**
   * Maps CSV via LLM in chunks. Invokes handlers after each chunk
   * so callers can stream progress (SSE) or aggregate.
   */
  async mapBatches(
    parsedCsv: ParsedCsv,
    handlers: ImportStreamHandlers,
  ): Promise<void> {
    const batches = chunkArray(parsedCsv.rows, env.AI_BATCH_SIZE);
    let rowOffset = 0;
    let totalRecords = 0;
    let totalSkipped = 0;

    if (batches.length === 0) {
      handlers.onComplete({ total_processed: 0 });
      return;
    }

    for (const batchRows of batches) {
      const userPrompt = buildUserPrompt({
        headers: parsedCsv.headers,
        rows: batchRows,
      });

      const response = await chat([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ]);

      const parsed = parseLlmBatchJson(response);

      const records = parsed.records.map((r) => normalizeCRMRecord(r));
      const skipped = parsed.skipped.map((s, i) =>
        normalizeSkippedRecord(s, parsedCsv.headers, rowOffset, i),
      );

      if (records.length > 0) {
        handlers.onBatch(records);
      }
      if (skipped.length > 0) {
        handlers.onSkipped(skipped);
      }

      totalRecords += records.length;
      totalSkipped += skipped.length;
      rowOffset += batchRows.length;
    }

    handlers.onComplete({
      total_processed: totalRecords + totalSkipped,
    });
  }
}

export const crmMappingService = new CrmMappingService();
