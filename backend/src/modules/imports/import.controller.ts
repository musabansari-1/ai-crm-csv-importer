import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { importService } from "./import.service.js";
import { logger } from "../../config/logger.js";

/** POST /api/v1/imports — full JSON ImportResult */
export const importCsv = asyncHandler(async (req: Request, res: Response) => {
  const result = await importService.importCsv(req.file);
  // Flat body matches frontend ImportResult (no { success, data } wrapper)
  res.status(200).json(result);
});

/**
 * POST /api/v1/imports/stream — SSE:
 * event: batch | skipped | done
 */
export const importCsvStream = asyncHandler(
  async (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    const writeEvent = (event: string, data: unknown) => {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      await importService.importCsvStream(req.file, {
        onBatch: (records) => writeEvent("batch", records),
        onSkipped: (skipped) => writeEvent("skipped", skipped),
        onComplete: (summary) => {
          writeEvent("done", summary);
          res.end();
        },
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Import stream failed";
      logger.error({ err }, "import stream error");
      // SSE error event — frontend parseImportSSE may not handle it;
      // ending with non-OK isn't possible after headers. Emit error + close.
      writeEvent("error", { message });
      res.end();
    }
  },
);
