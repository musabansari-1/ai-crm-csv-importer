const MAX_CSV_BYTES = 10 * 1024 * 1024

const ALLOWED_MIME_TYPES = new Set([
  'text/csv',
  'application/vnd.ms-excel',
])

export type CSVValidationResult =
  | { valid: true }
  | { valid: false; reason: string }

export function validateCSVFile(file: File): CSVValidationResult {
  // 1. Empty file
  if (file.size === 0) {
    return { valid: false, reason: 'File is empty' }
  }

  // 2. Extension must be .csv
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return { valid: false, reason: 'Only .csv files are supported' }
  }

  // 3. MIME type (some browsers leave type empty for CSV — reject non-empty wrong types)
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, reason: 'Invalid file type' }
  }

  // 4. Size limit
  if (file.size > MAX_CSV_BYTES) {
    return {
      valid: false,
      reason: 'File too large — maximum size is 10MB',
    }
  }

  return { valid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
