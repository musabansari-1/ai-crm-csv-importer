import type { CRMRecord } from '@/types'

const CSV_HEADERS: (keyof CRMRecord)[] = [
  'created_at',
  'name',
  'email',
  'country_code',
  'mobile_without_country_code',
  'company',
  'city',
  'state',
  'country',
  'lead_owner',
  'crm_status',
  'crm_note',
  'data_source',
  'possession_time',
  'description',
]

/** Escape a CSV cell: wrap in quotes when needed; double internal quotes. */
export function escapeCSVCell(value: string): string {
  const needsQuotes =
    value.includes(',') ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')

  const escaped = value.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

export function recordsToCSV(records: CRMRecord[]): string {
  const headerLine = CSV_HEADERS.join(',')
  const lines = records.map((record) =>
    CSV_HEADERS.map((key) => escapeCSVCell(String(record[key] ?? ''))).join(
      ','
    )
  )
  return [headerLine, ...lines].join('\n')
}

/**
 * Converts CRM records to a CSV string and triggers a browser download.
 */
export function exportToCSV(records: CRMRecord[], filename: string): void {
  const csv = recordsToCSV(records)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
