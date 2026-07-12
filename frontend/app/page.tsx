'use client'

import { useEffect, useRef, useState } from 'react'
import { DropZone } from '@/components/upload/DropZone'
import { PreviewStats } from '@/components/preview/PreviewStats'
import { PreviewTable } from '@/components/preview/PreviewTable'
import { PreviewSkeleton } from '@/components/preview/PreviewSkeleton'
import { ConfirmBar } from '@/components/confirm/ConfirmBar'
import { ProgressIndicator } from '@/components/confirm/ProgressIndicator'
import { ImportErrorCard } from '@/components/confirm/ImportErrorCard'
import { ResultsTable } from '@/components/results/ResultsTable'
import { ResultsSummary } from '@/components/results/ResultsSummary'
import { ResultsSkeleton } from '@/components/results/ResultsSkeleton'
import { ExportButton } from '@/components/results/ExportButton'
import { AllSkippedWarning } from '@/components/results/AllSkippedWarning'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { useCSVParser } from '@/hooks/useCSVParser'
import { useImport } from '@/hooks/useImport'
import { useToast } from '@/hooks/useToast'
import type { ImportStep } from '@/types'

export default function Home() {
  const { toast } = useToast()
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
    retry,
  } = useImport()

  const [currentStep, setCurrentStep] = useState<ImportStep>('upload')
  const [fileSizeBytes, setFileSizeBytes] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [visible, setVisible] = useState(true)
  const prevImportStatus = useRef(importStatus)

  // Advance to results as soon as streaming batches arrive (or on success)
  useEffect(() => {
    if (importStatus === 'loading' && streamingRecords.length > 0) {
      setCurrentStep('results')
    }
    if (importStatus === 'success') {
      setCurrentStep('results')
    }
  }, [importStatus, streamingRecords.length])

  // Import outcome toasts — only on status transitions
  useEffect(() => {
    const prev = prevImportStatus.current
    if (prev !== importStatus) {
      if (importStatus === 'success' && result) {
        toast(`${result.records.length} leads imported`, 'success')
      }
      if (importStatus === 'error' && importError) {
        toast(`${importError} (attempt ${attempt} of 3)`, 'error')
      }
    }
    prevImportStatus.current = importStatus
  }, [importStatus, result, importError, attempt, toast])

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
    toast('File removed', 'info')
    fadeTo(() => {
      resetParser()
      resetImport()
      setSelectedFile(null)
      setFileSizeBytes(0)
      setCurrentStep('upload')
    })
  }

  function handleConfirmImport() {
    if (!selectedFile) return
    setCurrentStep('importing')
    void startImport(selectedFile)
  }

  function handleImportAnother() {
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
  const showSkeleton = parseStatus === 'parsing' && parsedCount === 0
  const showTable =
    (parseStatus === 'parsing' ||
      parseStatus === 'done' ||
      parseStatus === 'error') &&
    !showSkeleton
  const showResultsSkeleton =
    importStatus === 'loading' && streamingRecords.length === 0

  const displayRecords =
    result?.records ??
    (streamingRecords.length > 0 ? streamingRecords : [])

  const allSkipped =
    importStatus === 'success' &&
    result !== null &&
    result.records.length === 0 &&
    result.skipped.length > 0

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
                  toast(message, 'error')
                }}
                onFileRemoved={() => {
                  toast('File removed', 'info')
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

              {importStatus === 'error' && importError && (
                <ImportErrorCard message={importError} onRetry={() => void retry()} />
              )}
            </>
          )}

          {currentStep === 'importing' && (
            <div className="mx-auto max-w-xl space-y-4">
              {importStatus === 'loading' && (
                <ProgressIndicator attempt={attempt} />
              )}
              {importStatus === 'error' && importError && (
                <ImportErrorCard message={importError} onRetry={() => void retry()} />
              )}
            </div>
          )}

          {currentStep === 'results' && (
            <>
              {importStatus === 'loading' && (
                <ProgressIndicator attempt={attempt} />
              )}

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                      Import Results
                    </h2>
                    {importStatus === 'loading' && (
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        Streaming… {streamingRecords.length} records
                      </p>
                    )}
                  </div>

                  {!allSkipped && (
                    <ResultsSummary
                      imported={
                        result?.records.length ?? streamingRecords.length
                      }
                      skipped={result?.skipped.length ?? 0}
                      total={
                        result?.total_processed ?? streamingRecords.length
                      }
                      skippedRecords={result?.skipped}
                    />
                  )}
                </div>

                <div className="shrink-0">
                  <ExportButton records={displayRecords} />
                </div>
              </div>

              {allSkipped && result ? (
                <AllSkippedWarning skipped={result.skipped} />
              ) : showResultsSkeleton ? (
                <ResultsSkeleton />
              ) : (
                <ResultsTable records={displayRecords} />
              )}

              {importStatus === 'error' && importError && (
                <ImportErrorCard
                  message={importError}
                  onRetry={() => void retry()}
                />
              )}

              <div className="flex justify-center pt-4">
                <button
                  type="button"
                  onClick={handleImportAnother}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  Import Another File
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {currentStep === 'preview' && importStatus !== 'loading' && (
        <ConfirmBar
          rowCount={parseStatus === 'done' ? parsedCount : rows.length}
          status={importStatus}
          onConfirm={handleConfirmImport}
        />
      )}
    </>
  )
}
