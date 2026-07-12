'use client'

import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { validateCSVFile } from '@/lib/csvValidator'
import {
  DropZoneContent,
  type DropZoneVisualState,
} from '@/components/upload/DropZoneContent'

interface DropZoneProps {
  onFileAccepted: (file: File) => void
  onError: (message: string) => void
  onFileRemoved?: () => void
}

const BASE_SHELL =
  'relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 px-6 py-12 text-center transition-colors sm:py-16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'

const STATE_SHELL: Record<DropZoneVisualState, string> = {
  idle: 'border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/40',
  dragover:
    'border-solid border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/40',
  error:
    'border-dashed border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-950/30',
  accepted:
    'border-solid border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-950/30',
}

function shellClassName(state: DropZoneVisualState): string {
  return `${BASE_SHELL} ${STATE_SHELL[state]}`
}

export function DropZone({
  onFileAccepted,
  onError,
  onFileRemoved,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [visualState, setVisualState] = useState<DropZoneVisualState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [acceptedFile, setAcceptedFile] = useState<File | null>(null)

  function processFile(file: File) {
    const result = validateCSVFile(file)
    if (!result.valid) {
      setAcceptedFile(null)
      setErrorMessage(result.reason)
      setVisualState('error')
      onError(result.reason)
      return
    }
    setErrorMessage(null)
    setAcceptedFile(file)
    setVisualState('accepted')
    onFileAccepted(file)
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    if (visualState !== 'dragover') setVisualState('dragover')
  }

  function handleDragEnter(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setVisualState('dragover')
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setVisualState(acceptedFile ? 'accepted' : errorMessage ? 'error' : 'idle')
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files[0]
    if (!file) {
      setVisualState(acceptedFile ? 'accepted' : 'idle')
      return
    }
    processFile(file)
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  function handleRemove() {
    setAcceptedFile(null)
    setErrorMessage(null)
    setVisualState('idle')
    if (inputRef.current) inputRef.current.value = ''
    onFileRemoved?.()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload CSV file — drag and drop or press Enter to browse"
      className={shellClassName(visualState)}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        if (visualState !== 'accepted') inputRef.current?.click()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (visualState !== 'accepted') inputRef.current?.click()
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={handleInputChange}
      />
      <DropZoneContent
        visualState={visualState}
        errorMessage={errorMessage}
        acceptedFile={acceptedFile}
        onRemove={handleRemove}
      />
    </div>
  )
}
