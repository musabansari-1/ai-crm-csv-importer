'use client'

import { useState } from 'react'
import { AlertTriangle, BarChart3, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react'
import type { SkippedRecord } from '@/types'

interface ResultsSummaryProps {
  imported: number
  skipped: number
  total: number
  skippedRecords?: SkippedRecord[]
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: number
  tone: 'green' | 'amber' | 'blue'
}) {
  const tones = {
    green:
      'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/40',
    amber:
      'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40',
    blue: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40',
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${tones[tone]}`}
    >
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </p>
        <p className="text-xl font-bold tabular-nums text-gray-900 dark:text-gray-50">
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export function ResultsSummary({
  imported,
  skipped,
  total,
  skippedRecords = [],
}: ResultsSummaryProps) {
  const [open, setOpen] = useState(false)
  const records = skippedRecords.length > 0 ? skippedRecords : []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          tone="green"
          label="Imported"
          value={imported}
          icon={
            <CheckCircle2
              className="h-6 w-6 text-green-600 dark:text-green-400"
              aria-hidden
            />
          }
        />
        <StatCard
          tone="amber"
          label="Skipped"
          value={skipped}
          icon={
            <AlertTriangle
              className="h-6 w-6 text-amber-600 dark:text-amber-400"
              aria-hidden
            />
          }
        />
        <StatCard
          tone="blue"
          label="Total"
          value={total}
          icon={
            <BarChart3
              className="h-6 w-6 text-blue-600 dark:text-blue-400"
              aria-hidden
            />
          }
        />
      </div>

      {skipped > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900/40">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-100 dark:hover:bg-gray-800/50"
          >
            {open ? (
              <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
            )}
            View skipped records
          </button>

          {open && (
            <ul className="space-y-3 border-t border-gray-200 px-4 py-3 dark:border-gray-800">
              {records.length === 0 ? (
                <li className="text-sm text-gray-500 dark:text-gray-400">
                  {skipped} record{skipped === 1 ? '' : 's'} skipped
                </li>
              ) : (
                records.map((item) => {
                  const rawPreview = Object.entries(item.raw)
                    .slice(0, 3)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' · ')

                  return (
                    <li
                      key={`${item.row}-${item.reason}`}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    >
                      <p>
                        <span className="font-semibold">Row {item.row}</span>
                        {' — '}
                        {item.reason}
                      </p>
                      {rawPreview && (
                        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                          {rawPreview}
                        </p>
                      )}
                    </li>
                  )
                })
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
