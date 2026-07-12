interface ImportErrorCardProps {
  message: string
  onRetry: () => void
}

export function ImportErrorCard({ message, onRetry }: ImportErrorCardProps) {
  return (
    <div className="rounded-xl border border-red-300 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/40">
      <p className="text-sm font-semibold text-red-800 dark:text-red-200">
        Import failed
      </p>
      <p className="mt-1 text-sm text-red-700 dark:text-red-300">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-red-500 dark:hover:bg-red-600"
      >
        Retry
      </button>
    </div>
  )
}
