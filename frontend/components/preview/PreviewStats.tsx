interface PreviewStatsProps {
  rowCount: number
  columnCount: number
  fileSizeBytes: number
  parsedCount: number
  status: 'parsing' | 'done'
}

function formatKb(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 sm:text-sm">
      {children}
    </span>
  )
}

export function PreviewStats({
  rowCount,
  columnCount,
  fileSizeBytes,
  parsedCount,
  status,
}: PreviewStatsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Pill>{rowCount.toLocaleString()} rows</Pill>
        <Pill>{columnCount.toLocaleString()} columns</Pill>
        <Pill>{formatKb(fileSizeBytes)}</Pill>
      </div>

      {status === 'parsing' ? (
        <p className="animate-pulse text-sm font-medium text-blue-600 dark:text-blue-400">
          Parsing… {parsedCount.toLocaleString()} rows so far
        </p>
      ) : (
        <p className="text-sm font-medium text-green-700 dark:text-green-400">
          ✓ {parsedCount.toLocaleString()} rows parsed
        </p>
      )}
    </div>
  )
}
