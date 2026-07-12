'use client'

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

interface PreviewTableProps {
  headers: string[]
  rows: Record<string, string>[]
}

const ROW_HEIGHT = 40
const MAX_CELL_CHARS = 40
const MIN_COL_WIDTH = 120

function truncateCell(value: string): string {
  if (value.length <= MAX_CELL_CHARS) return value
  return `${value.slice(0, MAX_CELL_CHARS)}…`
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900/40">
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  )
}

export function PreviewTable({ headers, rows }: PreviewTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 12,
  })

  if (headers.length === 0) {
    return <EmptyState message="No data found in this file" />
  }

  if (rows.length === 0) {
    return (
      <EmptyState message="This CSV has no data rows — only headers were found" />
    )
  }

  const colTemplate = `repeat(${headers.length}, minmax(${MIN_COL_WIDTH}px, 1fr))`
  const minTableWidth = headers.length * MIN_COL_WIDTH

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      {/* Single scrollport for virtualizer (x + y) */}
      <div
        ref={parentRef}
        className="max-h-[28rem] overflow-auto"
        role="table"
        aria-label="CSV preview"
        aria-rowcount={rows.length + 1}
      >
        <div style={{ minWidth: minTableWidth }}>
          <div
            role="row"
            className="sticky top-0 z-10 grid border-b border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
            style={{ gridTemplateColumns: colTemplate }}
          >
            {headers.map((header) => (
              <div
                key={header}
                role="columnheader"
                className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold tracking-wide text-gray-700 dark:text-gray-200"
                title={header}
              >
                {header}
              </div>
            ))}
          </div>

          {/* height/transform are required by @tanstack/react-virtual */}
          <div
            className="relative w-full"
            style={{ height: rowVirtualizer.getTotalSize() }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index]
              const stripe =
                virtualRow.index % 2 === 0
                  ? 'bg-white dark:bg-gray-900'
                  : 'bg-gray-50 dark:bg-gray-800/50'

              return (
                <div
                  key={virtualRow.key}
                  role="row"
                  aria-rowindex={virtualRow.index + 2}
                  className={`absolute left-0 top-0 grid w-full border-b border-gray-100 dark:border-gray-800/80 ${stripe}`}
                  style={{
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                    gridTemplateColumns: colTemplate,
                  }}
                >
                  {headers.map((header) => {
                    const raw = row[header] ?? ''
                    return (
                      <div
                        key={header}
                        role="cell"
                        className="truncate px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
                        title={raw}
                      >
                        {truncateCell(raw)}
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
