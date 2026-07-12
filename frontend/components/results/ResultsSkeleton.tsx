import { Skeleton } from '@/components/ui/Skeleton'

const COLUMN_COUNT = 8
const ROW_COUNT = 5

export function ResultsSkeleton() {
  const columns = Array.from({ length: COLUMN_COUNT }, (_, i) => i)
  const rows = Array.from({ length: ROW_COUNT }, (_, i) => i)

  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
      aria-busy="true"
      aria-label="Loading import results"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
              {columns.map((col) => (
                <th key={col} className="min-w-[120px] px-3 py-2 text-left">
                  <Skeleton className="h-4 w-24" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row}
                className={
                  row % 2 === 0
                    ? 'bg-white dark:bg-gray-900'
                    : 'bg-gray-50 dark:bg-gray-800/50'
                }
              >
                {columns.map((col) => (
                  <td key={col} className="min-w-[120px] px-3 py-2.5">
                    <Skeleton className="h-4 w-full max-w-[7rem]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
