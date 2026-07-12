'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { SkippedRecord } from '@/types'

interface AllSkippedWarningProps {
  skipped: SkippedRecord[]
}

export function AllSkippedWarning({ skipped }: AllSkippedWarningProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/40">
      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
        All {skipped.length} records were skipped — no leads were imported
      </p>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-amber-800 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-amber-200"
      >
        {open ? (
          <ChevronDown className="h-4 w-4" aria-hidden />
        ) : (
          <ChevronRight className="h-4 w-4" aria-hidden />
        )}
        {open ? 'Hide skip reasons' : 'View skip reasons'}
      </button>

      {open && (
        <ul className="mt-3 space-y-2 border-t border-amber-200 pt-3 dark:border-amber-800">
          {skipped.map((item) => (
            <li
              key={`${item.row}-${item.reason}`}
              className="text-sm text-amber-900 dark:text-amber-100"
            >
              <span className="font-medium">Row {item.row}:</span> {item.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
