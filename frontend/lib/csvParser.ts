import Papa from 'papaparse'

/**
 * Streams a CSV file row-by-row via PapaParse `step` (not `complete` batching).
 *
 * Note on duplicate column names: PapaParse automatically renames duplicates by
 * appending `_1`, `_2`, etc. Those renamed headers are passed through as-is.
 */
export function parseCSVStream(
  file: File,
  onRow: (row: Record<string, string>, index: number) => void,
  onComplete: (headers: string[], total: number) => void,
  onError: (err: Error) => void
): void {
  let headers: string[] = []
  let rowIndex = 0
  let total = 0
  let failed = false

  Papa.parse<Record<string, string>>(file, {
    header: true,
    skipEmptyLines: true,
    worker: false,
    step: (results, parser) => {
      if (failed) return

      // Abort on quote/delimiter errors; ignore soft field-mismatch noise
      const hardError = results.errors.find(
        (e) => e.type === 'Quotes' || e.type === 'Delimiter'
      )
      if (hardError) {
        failed = true
        parser.abort()
        onError(new Error(hardError.message || 'Failed to parse CSV'))
        return
      }

      if (headers.length === 0 && results.meta.fields) {
        headers = results.meta.fields.map(String)
      }

      const row = results.data
      const normalized: Record<string, string> = {}
      for (const key of Object.keys(row)) {
        const value = row[key]
        normalized[key] = value == null ? '' : String(value)
      }

      onRow(normalized, rowIndex)
      rowIndex += 1
      total += 1
    },
    complete: () => {
      if (failed) return

      // Headers-only: step never runs, so meta.fields is empty in stream mode.
      // Re-parse with preview to recover header names; total stays 0 (not an error).
      if (headers.length === 0 && total === 0) {
        Papa.parse<Record<string, string>>(file, {
          header: true,
          skipEmptyLines: true,
          preview: 1,
          complete: (results) => {
            const fields = (results.meta.fields ?? []).map(String)
            onComplete(fields, 0)
          },
          error: (err: Error) => {
            onError(err instanceof Error ? err : new Error(String(err)))
          },
        })
        return
      }

      onComplete(headers, total)
    },
    error: (err: Error) => {
      failed = true
      onError(err instanceof Error ? err : new Error(String(err)))
    },
  })
}
