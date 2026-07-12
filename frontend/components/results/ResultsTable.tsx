'use client'

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { CRMRecord } from '@/types'

interface ResultsTableProps {
  records: CRMRecord[]
}

const ROW_HEIGHT = 44
const COLUMNS: { key: keyof CRMRecord; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'mobile_without_country_code', label: 'Mobile' },
  { key: 'company', label: 'Company' },
  { key: 'city', label: 'City' },
  { key: 'crm_status', label: 'CRM Status' },
]

export function ResultsTable({ records }: ResultsTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: records.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900/40">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No records imported
        </p>
      </div>
    )
  }

  const colTemplate = `repeat(${COLUMNS.length}, minmax(120px, 1fr))`
  const minWidth = COLUMNS.length * 120

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <div ref={parentRef} className="max-h-[28rem] overflow-auto">
        <div style={{ minWidth }}>
          <div
            className="sticky top-0 z-10 grid border-b border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
            style={{ gridTemplateColumns: colTemplate }}
          >
            {COLUMNS.map((col) => (
              <div
                key={col.key}
                className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200"
              >
                {col.label}
              </div>
            ))}
          </div>

          <div
            className="relative w-full"
            style={{ height: rowVirtualizer.getTotalSize() }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const record = records[virtualRow.index]
              const stripe =
                virtualRow.index % 2 === 0
                  ? 'bg-white dark:bg-gray-900'
                  : 'bg-gray-50 dark:bg-gray-800/50'

              return (
                <div
                  key={virtualRow.key}
                  className={`absolute left-0 top-0 grid w-full border-b border-gray-100 dark:border-gray-800/80 ${stripe}`}
                  style={{
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                    gridTemplateColumns: colTemplate,
                  }}
                >
                  {COLUMNS.map((col) => {
                    const raw = String(record[col.key] ?? '')
                    return (
                      <div
                        key={col.key}
                        className="truncate px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
                        title={raw}
                      >
                        {raw || '—'}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
