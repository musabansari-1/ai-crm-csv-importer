import { AlertCircle, FileSpreadsheet, Upload, X } from 'lucide-react'
import { formatFileSize } from '@/lib/csvValidator'

export type DropZoneVisualState = 'idle' | 'dragover' | 'error' | 'accepted'

interface DropZoneContentProps {
  visualState: DropZoneVisualState
  errorMessage: string | null
  acceptedFile: File | null
  onRemove: () => void
}

export function DropZoneContent({
  visualState,
  errorMessage,
  acceptedFile,
  onRemove,
}: DropZoneContentProps) {
  if (visualState === 'dragover') {
    return (
      <>
        <Upload
          className="mb-4 h-10 w-10 text-blue-600 dark:text-blue-400"
          aria-hidden
        />
        <p className="text-base font-semibold text-blue-700 dark:text-blue-300 sm:text-lg">
          Drop it!
        </p>
      </>
    )
  }

  if (visualState === 'error') {
    return (
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
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Click or drop another file to try again
        </p>
      </>
    )
  }

  if (visualState === 'accepted' && acceptedFile) {
    return (
      <>
        <FileSpreadsheet
          className="mb-4 h-10 w-10 text-green-600 dark:text-green-400"
          aria-hidden
        />
        <p className="break-all text-base font-medium text-gray-900 dark:text-gray-50 sm:text-lg">
          {acceptedFile.name}
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {formatFileSize(acceptedFile.size)}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          <X className="h-4 w-4" aria-hidden />
          Remove
        </button>
      </>
    )
  }

  return (
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
  )
}
