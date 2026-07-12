import type { CRMRecord, ImportResult, SkippedRecord } from '@/types'

export interface SSEHandlers {
  onBatch: (records: CRMRecord[]) => void
  onSkipped: (skipped: SkippedRecord[]) => void
  onComplete: (summary: { total_processed: number }) => void
}

/**
 * Parses a text/event-stream body.
 * Expected events: `batch` | `skipped` | `done` with JSON `data:` payloads.
 */
export async function parseImportSSE(
  body: ReadableStream<Uint8Array>,
  handlers: SSEHandlers
): Promise<void> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let eventName = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n')
    buffer = parts.pop() ?? ''

    for (const rawLine of parts) {
      const line = rawLine.replace(/\r$/, '')

      if (line === '') {
        eventName = ''
        continue
      }

      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim()
        continue
      }

      if (line.startsWith('data:')) {
        const payload = line.slice(5).trim()
        if (!payload) continue
        dispatchSSEData(eventName, payload, handlers)
      }
    }
  }

  // Flush trailing data line without final blank separator
  if (buffer.startsWith('data:')) {
    const payload = buffer.slice(5).trim()
    if (payload) dispatchSSEData(eventName, payload, handlers)
  }
}

function dispatchSSEData(
  eventName: string,
  payload: string,
  handlers: SSEHandlers
): void {
  let data: unknown
  try {
    data = JSON.parse(payload) as unknown
  } catch {
    throw new Error('Invalid SSE JSON payload')
  }

  // Support event: field, or type property on the payload
  const typeFromBody =
    data &&
    typeof data === 'object' &&
    'type' in data &&
    typeof (data as { type: unknown }).type === 'string'
      ? (data as { type: string }).type
      : ''

  const type = eventName || typeFromBody

  if (type === 'batch') {
    const records = extractRecords(data)
    handlers.onBatch(records)
    return
  }

  if (type === 'skipped') {
    const skipped = extractSkipped(data)
    handlers.onSkipped(skipped)
    return
  }

  if (type === 'done') {
    const summary = extractSummary(data)
    handlers.onComplete(summary)
    return
  }

  // Bare ImportResult JSON inside a data line
  if (isImportResult(data)) {
    handlers.onBatch(data.records)
    handlers.onSkipped(data.skipped)
    handlers.onComplete({ total_processed: data.total_processed })
  }
}

function extractRecords(data: unknown): CRMRecord[] {
  if (Array.isArray(data)) return data as CRMRecord[]
  if (
    data &&
    typeof data === 'object' &&
    'records' in data &&
    Array.isArray((data as { records: unknown }).records)
  ) {
    return (data as { records: CRMRecord[] }).records
  }
  return []
}

function extractSkipped(data: unknown): SkippedRecord[] {
  if (Array.isArray(data)) return data as SkippedRecord[]
  if (
    data &&
    typeof data === 'object' &&
    'skipped' in data &&
    Array.isArray((data as { skipped: unknown }).skipped)
  ) {
    return (data as { skipped: SkippedRecord[] }).skipped
  }
  return []
}

function extractSummary(data: unknown): { total_processed: number } {
  if (
    data &&
    typeof data === 'object' &&
    'total_processed' in data &&
    typeof (data as { total_processed: unknown }).total_processed === 'number'
  ) {
    return {
      total_processed: (data as { total_processed: number }).total_processed,
    }
  }
  return { total_processed: 0 }
}

function isImportResult(data: unknown): data is ImportResult {
  return (
    !!data &&
    typeof data === 'object' &&
    Array.isArray((data as ImportResult).records) &&
    Array.isArray((data as ImportResult).skipped) &&
    typeof (data as ImportResult).total_processed === 'number'
  )
}

/** When /stream returns JSON instead of SSE, treat as a single batch. */
export function applyJsonImportResult(
  result: ImportResult,
  handlers: SSEHandlers
): void {
  handlers.onBatch(result.records)
  handlers.onSkipped(result.skipped)
  handlers.onComplete({ total_processed: result.total_processed })
}
