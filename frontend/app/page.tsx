'use client'

import { DropZone } from '@/components/upload/DropZone'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { useCSVParser } from '@/hooks/useCSVParser'

export default function Home() {
  const { status, rows, headers, parsedCount, error, parseFile, reset } =
    useCSVParser()

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-10">
        <StepIndicator currentStep="upload" />
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        <DropZone
          onFileAccepted={(file) => {
            console.log('Accepted CSV file:', file.name)
            parseFile(file)
          }}
          onError={(message) => {
            console.error('CSV validation error:', message)
            reset()
          }}
        />

        {/* Temporary parse status panel for Step 6 verification */}
        {status !== 'idle' && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm dark:border-gray-800 dark:bg-gray-900/50">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Parser status:{' '}
              <span className="font-normal text-gray-600 dark:text-gray-300">
                {status}
              </span>
            </p>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Rows streamed: {parsedCount} · Columns: {headers.length}
            </p>
            {headers.length > 0 && (
              <p className="mt-1 truncate text-gray-500 dark:text-gray-500">
                Headers: {headers.join(', ')}
              </p>
            )}
            {status === 'done' && rows.length === 0 && headers.length > 0 && (
              <p className="mt-2 text-amber-700 dark:text-amber-400">
                Headers-only CSV — no data rows (status remains done, not error).
              </p>
            )}
            {error && (
              <p className="mt-2 text-red-600 dark:text-red-400">{error}</p>
            )}
            {status === 'parsing' && (
              <p className="mt-2 animate-pulse text-blue-600 dark:text-blue-400">
                Streaming rows into state…
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
