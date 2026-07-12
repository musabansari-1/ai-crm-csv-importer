'use client'

import { useState } from 'react'
import { DropZone } from '@/components/upload/DropZone'
import { PreviewStats } from '@/components/preview/PreviewStats'
import { PreviewTable } from '@/components/preview/PreviewTable'
import { PreviewSkeleton } from '@/components/preview/PreviewSkeleton'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { useCSVParser } from '@/hooks/useCSVParser'

export default function Home() {
  const { status, rows, headers, parsedCount, error, parseFile, reset } =
    useCSVParser()
  const [fileSizeBytes, setFileSizeBytes] = useState(0)

  const statsStatus =
    status === 'parsing' || status === 'done' ? status : null
  const showSkeleton = status === 'parsing' && rows.length === 0
  const showTable =
    (status === 'parsing' || status === 'done' || status === 'error') &&
    !showSkeleton

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-10">
        <StepIndicator currentStep="upload" />
      </div>

      <div className="space-y-6">
        <div className="mx-auto max-w-2xl">
          <DropZone
            onFileAccepted={(file) => {
              console.log('Accepted CSV file:', file.name)
              setFileSizeBytes(file.size)
              parseFile(file)
            }}
            onError={(message) => {
              console.error('CSV validation error:', message)
              setFileSizeBytes(0)
              reset()
            }}
          />
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
      </div>
    </main>
  )
}
