'use client'

import { useEffect } from 'react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  unstable_retry: () => void
}

export default function ErrorPage({ error, unstable_retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
        Something went wrong
      </h1>
      <pre className="mt-4 w-full overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-left text-xs text-red-700 dark:border-gray-800 dark:bg-gray-900 dark:text-red-300">
        {error.message}
      </pre>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-6 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        Try Again
      </button>
    </main>
  )
}
