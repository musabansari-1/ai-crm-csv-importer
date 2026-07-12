'use client'

import { useState } from 'react'
import { DropZone } from '@/components/upload/DropZone'
import { PreviewStats } from '@/components/preview/PreviewStats'
import { PreviewTable } from '@/components/preview/PreviewTable'
import { PreviewSkeleton } from '@/components/preview/PreviewSkeleton'
import { ConfirmBar } from '@/components/confirm/ConfirmBar'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { useCSVParser } from '@/hooks/useCSVParser'
import type { ImportStep } from '@/types'

export default function Home() {
  const { status, rows, headers, parsedCount, error, parseFile, reset } =
    useCSVParser()
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload')
  const [fileSizeBytes, setFileSizeBytes] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [visible, setVisible] = useState(true)

  function fadeTo(next: () => void) {
    setVisible(false)
    window.setTimeout(() => {
      next()
      setVisible(true)
    }, 150)
  }

  function handleFileAccepted(file: File) {
    setSelectedFile(file)
    setFileSizeBytes(file.size)
    parseFile(file)
    fadeTo(() => setCurrentStep('preview'))
  }

  function handleChangeFile() {
    fadeTo(() => {
      reset()
      setSelectedFile(null)
      setFileSizeBytes(0)
      setCurrentStep('upload')
    })
  }

  const statsStatus =
    status === 'parsing' || status === 'done' ? status : null
  const showSkeleton = status === 'parsing' && rows.length === 0
  const showTable =
    (status === 'parsing' || status === 'done' || status === 'error') &&
    !showSkeleton

  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6">
        <div className="mb-10">
          <StepIndicator currentStep={currentStep} />
        </div>

        <div
          className={`space-y-6 transition-opacity duration-150 ${
            visible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {currentStep === 'upload' && (
            <div className="mx-auto max-w-2xl">
              <DropZone
                onFileAccepted={handleFileAccepted}
                onError={(message) => {
                  console.error('CSV validation error:', message)
                }}
              />
            </div>
          )}

          {currentStep === 'preview' && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleChangeFile}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  ← Change File
                </button>
                {selectedFile && (
                  <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                    {selectedFile.name}
                  </p>
                )}
              </div>

              {statsStatus && (
                <PreviewStats
                  rowCount={rows.length}
                  columnCount={headers.length}
                  fileSizeBytes={fileSizeBytes}
                  parsedCount={parsedCount}
                  status={statsStatus}
                />
              )}

              {showSkeleton && <PreviewSkeleton />}
              {showTable && <PreviewTable headers={headers} rows={rows} />}

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </>
          )}
        </div>
      </main>

      {currentStep === 'preview' && (
        <ConfirmBar
          rowCount={status === 'done' ? parsedCount : rows.length}
          status="idle"
          onConfirm={() => {
            // Wired to useImport in Step 10/13
            console.log('Import Leads clicked', {
              file: selectedFile?.name,
              rows: parsedCount,
            })
          }}
        />
      )}
    </>
  )
}
