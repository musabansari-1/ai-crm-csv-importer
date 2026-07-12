'use client'

import { Loader2 } from 'lucide-react'
import type { ImportStatus } from '@/types'

interface ConfirmBarProps {
  rowCount: number
  status: ImportStatus
  onConfirm: () => void
}

export function ConfirmBar({ rowCount, status, onConfirm }: ConfirmBarProps) {
  const isLoading = status === 'loading'
  const noRows = rowCount === 0
  const disabled = isLoading || noRows

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {rowCount.toLocaleString()} rows ready to import
        </p>

        <span
          className="inline-flex w-full sm:w-auto"
          title={noRows ? 'No data rows to import' : undefined}
        >
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            aria-disabled={disabled}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 sm:w-auto"
          >
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            )}
            Import Leads →
          </button>
        </span>
      </div>
    </div>
  )
}
