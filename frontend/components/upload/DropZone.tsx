import { AlertCircle, Upload } from 'lucide-react'

export type DropZoneVisualState = 'idle' | 'dragover' | 'error'

interface DropZoneProps {
  /** Visual shell only — file handling is wired in Step 5 */
  state?: DropZoneVisualState
  errorMessage?: string
}

export function DropZone({
  state = 'idle',
  errorMessage = 'Something went wrong with this file',
}: DropZoneProps) {
  const shellClass = [
    'flex w-full flex-col items-center justify-center rounded-xl border-2 px-6 py-12 text-center transition-colors sm:py-16',
    state === 'idle' &&
      'border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40',
    state === 'dragover' &&
      'border-solid border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/40',
    state === 'error' &&
      'border-dashed border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-950/30',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClass} role="region" aria-label="CSV upload dropzone">
      {state === 'idle' && (
        <>
          <Upload
            className="mb-4 h-10 w-10 text-gray-400 dark:text-gray-500"
            aria-hidden
          />
          <p className="text-base font-medium text-gray-800 dark:text-gray-100 sm:text-lg">
            Drag & drop your CSV here
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            or click to browse
          </p>
        </>
      )}

      {state === 'dragover' && (
        <>
          <Upload
            className="mb-4 h-10 w-10 text-blue-600 dark:text-blue-400"
            aria-hidden
          />
          <p className="text-base font-semibold text-blue-700 dark:text-blue-300 sm:text-lg">
            Drop it!
          </p>
        </>
      )}

      {state === 'error' && (
        <>
          <AlertCircle
            className="mb-4 h-10 w-10 text-red-600 dark:text-red-400"
            aria-hidden
          />
          <p className="text-base font-medium text-red-700 dark:text-red-300 sm:text-lg">
            Upload failed
          </p>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </p>
        </>
      )}
    </div>
  )
}
