export default function Loading() {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-800 dark:border-t-blue-400" />
    </div>
  )
}
