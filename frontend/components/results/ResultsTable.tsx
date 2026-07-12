'use client'

import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { CRMRecord, CRMStatus } from '@/types'

interface ResultsTableProps {
  records: CRMRecord[]
}

const ROW_HEIGHT = 44
const MIN_COL_WIDTH = 120
const NOTE_MAX = 60

/** Fixed column order for CRM import results */
const COLUMNS: (keyof CRMRecord)[] = [
  'name',
  'email',
  'mobile_without_country_code',
  'company',
  'city',
  'state',
  'country',
  'crm_status',
  'crm_note',
  'data_source',
  'created_at',
  'lead_owner',
  'country_code',
  'possession_time',
  'description',
]

function formatHeader(key: string): string {
  return key.replace(/_/g, ' ')
}

function truncateNote(value: string): string {
  if (value.length <= NOTE_MAX) return value
  return `${value.slice(0, NOTE_MAX)}…`
}

function isCRMStatus(value: string): value is CRMStatus | '' {
  return (
    value === '' ||
    value === 'GOOD_LEAD_FOLLOW_UP' ||
    value === 'DID_NOT_CONNECT' ||
    value === 'BAD_LEAD' ||
    value === 'SALE_DONE'
  )
}

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

  const colTemplate = `repeat(${COLUMNS.length}, minmax(${MIN_COL_WIDTH}px, 1fr))`
  const minWidth = COLUMNS.length * MIN_COL_WIDTH

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
      <div ref={parentRef} className="max-h-[28rem] overflow-auto">
        <div style={{ minWidth }}>
          <div
            className="sticky top-0 z-10 grid border-b border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
            style={{ gridTemplateColumns: colTemplate }}
          >
            {COLUMNS.map((key) => (
              <div
                key={key}
                className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold capitalize tracking-wide text-gray-700 dark:text-gray-200"
              >
                {formatHeader(key)}
              </div>
            ))}
          </div>

          {/* height/transform required by @tanstack/react-virtual */}
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
                  {COLUMNS.map((key) => {
                    const raw = String(record[key] ?? '')

                    if (key === 'crm_status') {
                      const status = isCRMStatus(raw) ? raw : ''
                      return (
                        <div
                          key={key}
                          className="flex items-center px-3 py-2"
                        >
                          <StatusBadge status={status} />
                        </div>
                      )
                    }

                    if (key === 'crm_note') {
                      return (
                        <div
                          key={key}
                          className="truncate px-3 py-2 text-sm text-gray-800 dark:text-gray-200"
                          title={raw}
                        >
                          {truncateNote(raw) || '—'}
                        </div>
                      )
                    }

                    return (
                      <div
                        key={key}
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
