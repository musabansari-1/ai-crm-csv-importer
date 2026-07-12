'use client'

import { useEffect, useState } from 'react'
import { DropZone } from '@/components/upload/DropZone'
import { PreviewStats } from '@/components/preview/PreviewStats'
import { PreviewTable } from '@/components/preview/PreviewTable'
import { PreviewSkeleton } from '@/components/preview/PreviewSkeleton'
import { ConfirmBar } from '@/components/confirm/ConfirmBar'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { useCSVParser } from '@/hooks/useCSVParser'
import { useImport } from '@/hooks/useImport'
import type { ImportStep } from '@/types'

export default function Home() {
  const {
    status: parseStatus,
    rows,
    headers,
    parsedCount,
    error: parseError,
    parseFile,
    reset: resetParser,
  } = useCSVParser()
  const {
    status: importStatus,
    streamingRecords,
    result,
    error: importError,
    attempt,
    startImport,
    reset: resetImport,
  } = useImport()

  const [currentStep, setCurrentStep] = useState<ImportStep>('upload')
  const [fileSizeBytes, setFileSizeBytes] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [visible, setVisible] = useState(true)

  // Temporary Step 10 verification: log each streaming batch growth
  useEffect(() => {
    if (importStatus === 'loading' && streamingRecords.length > 0) {
      console.log(
        `[useImport] batch update — streamingRecords: ${streamingRecords.length}`,
        streamingRecords.map((r) => r.name)
      )
    }
    if (importStatus === 'success' && result) {
      console.log('[useImport] success', {
        records: result.records.length,
        skipped: result.skipped.length,
        total_processed: result.total_processed,
        attempt,
      })
    }
    if (importStatus === 'error') {
      console.error('[useImport] error', importError, { attempt })
    }
  }, [importStatus, streamingRecords, result, importError, attempt])

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
    resetImport()
    parseFile(file)
    fadeTo(() => setCurrentStep('preview'))
  }

  function handleChangeFile() {
    fadeTo(() => {
      resetParser()
      resetImport()
      setSelectedFile(null)
      setFileSizeBytes(0)
      setCurrentStep('upload')
    })
  }

  const statsStatus =
    parseStatus === 'parsing' || parseStatus === 'done' ? parseStatus : null
  const showSkeleton = parseStatus === 'parsing' && rows.length === 0
  const showTable =
    (parseStatus === 'parsing' ||
      parseStatus === 'done' ||
      parseStatus === 'error') &&
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

              {parseError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {parseError}
                </p>
              )}

              {importStatus === 'loading' && (
                <p className="animate-pulse text-sm text-blue-600 dark:text-blue-400">
                  Importing… {streamingRecords.length} records streamed
                  {attempt > 1 ? ` (attempt ${attempt} of 3)` : ''}
                </p>
              )}
              {importStatus === 'success' && result && (
                <p className="text-sm text-green-700 dark:text-green-400">
                  Imported {result.records.length} · skipped{' '}
                  {result.skipped.length}
                </p>
              )}
            </>
          )}
        </div>
      </main>

      {currentStep === 'preview' && (
        <ConfirmBar
          rowCount={parseStatus === 'done' ? parsedCount : rows.length}
          status={importStatus}
          onConfirm={() => {
            if (selectedFile) {
              void startImport(selectedFile)
            }
          }}
        />
      )}
    </>
  )
}
