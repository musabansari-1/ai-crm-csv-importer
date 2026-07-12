import type { CRMRecord, ImportResult, SkippedRecord } from '@/types'
import { MOCK_CRM_RECORDS, MOCK_SKIPPED } from '@/lib/mockImportData'

export class APIError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'APIError'
    this.statusCode = statusCode
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

/**
 * Minimal mock implementations for useImport (Step 10).
 * Full JSON + SSE HTTP paths are completed in Step 11.
 */
export async function importCSV(_file: File): Promise<ImportResult> {
  await delay(3000)
  return {
    records: MOCK_CRM_RECORDS,
    skipped: MOCK_SKIPPED,
    total_processed: MOCK_CRM_RECORDS.length + MOCK_SKIPPED.length,
  }
}

export async function importCSVStream(
  _file: File,
  onBatch: (records: CRMRecord[]) => void,
  onSkipped: (skipped: SkippedRecord[]) => void,
  onComplete: (summary: { total_processed: number }) => void,
  onError: (err: Error) => void
): Promise<void> {
  try {
    // 3 incremental batches, 800ms apart (1–2 records each)
    const batches: CRMRecord[][] = [
      MOCK_CRM_RECORDS.slice(0, 1),
      MOCK_CRM_RECORDS.slice(1, 3),
      MOCK_CRM_RECORDS.slice(3, 4),
    ]

    for (const batch of batches) {
      await delay(800)
      onBatch(batch)
    }

    onSkipped(MOCK_SKIPPED)
    onComplete({
      total_processed: MOCK_CRM_RECORDS.length + MOCK_SKIPPED.length,
    })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    onError(error)
    throw error
  }
}
