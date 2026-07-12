'use client'

import { Download } from 'lucide-react'
import { exportToCSV } from '@/lib/csvExporter'
import type { CRMRecord } from '@/types'

interface ExportButtonProps {
  records: CRMRecord[]
}

export function ExportButton({ records }: ExportButtonProps) {
  const disabled = records.length === 0

  function handleExport() {
    if (disabled) return
    exportToCSV(records, `groweasy-import-${Date.now()}.csv`)
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled}
      aria-label="Download imported leads as CSV"
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto"
    >
      <Download className="h-4 w-4" aria-hidden />
      Download as CSV
    </button>
  )
}
