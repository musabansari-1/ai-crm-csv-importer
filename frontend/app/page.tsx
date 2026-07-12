'use client'

import { useState } from 'react'
import { DropZone } from '@/components/upload/DropZone'
import { PreviewStats } from '@/components/preview/PreviewStats'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { useCSVParser } from '@/hooks/useCSVParser'

export default function Home() {
  const { status, rows, headers, parsedCount, error, parseFile, reset } =
    useCSVParser()
  const [fileSizeBytes, setFileSizeBytes] = useState(0)

  const statsStatus =
    status === 'parsing' || status === 'done' ? status : null

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-10">
        <StepIndicator currentStep="upload" />
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
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

        {statsStatus && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
            <PreviewStats
              rowCount={rows.length}
              columnCount={headers.length}
              fileSizeBytes={fileSizeBytes}
              parsedCount={parsedCount}
              status={statsStatus}
            />
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    </main>
  )
}
