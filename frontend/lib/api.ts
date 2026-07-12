import type { CRMRecord, ImportResult, SkippedRecord } from '@/types'
import { MOCK_CRM_RECORDS, MOCK_SKIPPED } from '@/lib/mockImportData'
import {
  applyJsonImportResult,
  parseImportSSE,
} from '@/lib/sseParser'

export class APIError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'APIError'
    this.statusCode = statusCode
  }
}

function getApiBaseUrl(): string | undefined {
  const url = process.env.NEXT_PUBLIC_API_URL
  if (!url || url.trim() === '') return undefined
  return url.replace(/\/$/, '')
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function toFormData(file: File): FormData {
  const form = new FormData()
  form.append('file', file)
  return form
}

async function mockImportCSV(): Promise<ImportResult> {
  await delay(3000)
  return {
    records: MOCK_CRM_RECORDS,
    skipped: MOCK_SKIPPED,
    total_processed: MOCK_CRM_RECORDS.length + MOCK_SKIPPED.length,
  }
}

async function mockImportCSVStream(
  onBatch: (records: CRMRecord[]) => void,
  onSkipped: (skipped: SkippedRecord[]) => void,
  onComplete: (summary: { total_processed: number }) => void
): Promise<void> {
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
}

export async function importCSV(file: File): Promise<ImportResult> {
  const base = getApiBaseUrl()
  if (!base) return mockImportCSV()

  const response = await fetch(`${base}/api/v1/imports`, {
    method: 'POST',
    body: toFormData(file),
  })

  if (!response.ok) {
    throw new APIError(await readErrorMessage(response), response.status)
  }

  return (await response.json()) as ImportResult
}

export async function importCSVStream(
  file: File,
  onBatch: (records: CRMRecord[]) => void,
  onSkipped: (skipped: SkippedRecord[]) => void,
  onComplete: (summary: { total_processed: number }) => void,
  onError: (err: Error) => void
): Promise<void> {
  const base = getApiBaseUrl()
  const handlers = { onBatch, onSkipped, onComplete }

  if (!base) {
    try {
      await mockImportCSVStream(onBatch, onSkipped, onComplete)
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      onError(error)
      throw error
    }
    return
  }

  try {
    const response = await fetch(`${base}/api/import/stream`, {
      method: 'POST',
      body: toFormData(file),
    })

    if (!response.ok) {
      throw new APIError(await readErrorMessage(response), response.status)
    }

    const contentType = response.headers.get('content-type') ?? ''

    // SSE path
    if (contentType.includes('text/event-stream') && response.body) {
      await parseImportSSE(response.body, handlers)
      return
    }

    // Non-SSE: parse as JSON ImportResult and emit a single batch
    const result = (await response.json()) as ImportResult
    applyJsonImportResult(result, handlers)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    onError(error)
    throw error
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()
    if (
      body &&
      typeof body === 'object' &&
      'message' in body &&
      typeof (body as { message: unknown }).message === 'string'
    ) {
      return (body as { message: string }).message
    }
  } catch {
    // ignore
  }
  return `Request failed with status ${response.status}`
}
