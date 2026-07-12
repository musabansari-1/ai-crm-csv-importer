'use client'

import { useState } from 'react'
import {
  DropZone,
  type DropZoneVisualState,
} from '@/components/upload/DropZone'
import { StepIndicator } from '@/components/ui/StepIndicator'

const VISUAL_STATES: DropZoneVisualState[] = ['idle', 'dragover', 'error']

export default function Home() {
  // Temporary prop review — file handling lands in Step 5
  const [dropState, setDropState] = useState<DropZoneVisualState>('idle')

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-10">
        <StepIndicator currentStep="upload" />
      </div>

      <div className="mx-auto max-w-2xl space-y-6">
        <DropZone
          state={dropState}
          errorMessage="Only .csv files are supported"
        />

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            DropZone visual review — toggle states:
          </p>
          <div className="flex flex-wrap gap-2">
            {VISUAL_STATES.map((state) => (
              <button
                key={state}
                type="button"
                onClick={() => setDropState(state)}
                className={[
                  'rounded-lg border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                  dropState === state
                    ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800',
                ].join(' ')}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
