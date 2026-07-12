'use client'

import { useState } from 'react'
import { StepIndicator } from '@/components/ui/StepIndicator'
import type { ImportStep } from '@/types'

const REVIEW_STEPS: ImportStep[] = [
  'upload',
  'preview',
  'importing',
  'results',
]

export default function Home() {
  // Temporary prop-test control — wired to real flow in Step 9
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload')

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-10">
        <StepIndicator currentStep={currentStep} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/50">
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          StepIndicator prop review — cycle through all visual states:
        </p>
        <div className="flex flex-wrap gap-2">
          {REVIEW_STEPS.map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => setCurrentStep(step)}
              className={[
                'rounded-lg border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                currentStep === step
                  ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800',
              ].join(' ')}
            >
              {step}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
