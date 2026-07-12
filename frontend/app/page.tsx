'use client'

import { DropZone } from '@/components/upload/DropZone'
import { StepIndicator } from '@/components/ui/StepIndicator'

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-10">
        <StepIndicator currentStep="upload" />
      </div>

      <div className="mx-auto max-w-2xl">
        <DropZone
          onFileAccepted={(file) => {
            console.log('Accepted CSV file:', {
              name: file.name,
              size: file.size,
              type: file.type,
            })
          }}
          onError={(message) => {
            console.error('CSV validation error:', message)
          }}
        />
      </div>
    </main>
  )
}
