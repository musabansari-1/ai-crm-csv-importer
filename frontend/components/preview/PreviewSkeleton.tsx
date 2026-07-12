interface PreviewSkeletonProps {
  columnCount?: number
}

export function PreviewSkeleton({ columnCount = 5 }: PreviewSkeletonProps) {
  const columns = Array.from({ length: columnCount }, (_, i) => i)
  const rows = Array.from({ length: 5 }, (_, i) => i)

  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800"
      aria-busy="true"
      aria-label="Loading CSV preview"
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
              {columns.map((col) => (
                <th
                  key={col}
                  className="min-w-[120px] px-3 py-2 text-left"
                >
                  <div className="h-4 w-20 animate-pulse rounded bg-gray-300 dark:bg-gray-700" />
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
                    <div className="h-4 w-full max-w-[8rem] animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
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
