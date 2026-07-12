import { Check } from 'lucide-react'
import type { ImportStep } from '@/types'

interface StepIndicatorProps {
  currentStep: ImportStep
}

const STEPS: { key: ImportStep; label: string }[] = [
  { key: 'upload', label: 'Upload CSV' },
  { key: 'preview', label: 'Preview' },
  { key: 'importing', label: 'Confirm Import' },
  { key: 'results', label: 'Results' },
]

function stepIndex(step: ImportStep): number {
  return STEPS.findIndex((s) => s.key === step)
}

type StepState = 'upcoming' | 'active' | 'completed'

function getStepState(index: number, current: number): StepState {
  if (index < current) return 'completed'
  if (index === current) return 'active'
  return 'upcoming'
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const current = stepIndex(currentStep)

  return (
    <nav aria-label="Import progress" className="w-full">
      <ol className="flex items-center justify-between gap-1 sm:gap-2">
        {STEPS.map((step, index) => {
          const state = getStepState(index, current)
          const isLast = index === STEPS.length - 1

          return (
            <li key={step.key} className="flex min-w-0 flex-1 items-center">
              <div className="flex min-w-0 flex-col items-center gap-1.5 sm:flex-row sm:gap-2">
                <span
                  className={[
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                    state === 'upcoming' &&
                      'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
                    state === 'active' &&
                      'bg-blue-600 text-white dark:bg-blue-500',
                    state === 'completed' &&
                      'bg-green-600 text-white dark:bg-green-500',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-current={state === 'active' ? 'step' : undefined}
                >
                  {state === 'completed' ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={[
                    'max-w-[6.5rem] truncate text-center text-xs sm:max-w-none sm:text-left sm:text-sm',
                    state === 'active'
                      ? 'font-bold text-gray-900 dark:text-gray-50'
                      : state === 'completed'
                        ? 'font-normal text-gray-700 dark:text-gray-300'
                        : 'font-normal text-gray-400 dark:text-gray-500',
                    // Mobile: only show active step label
                    state === 'active' ? 'block' : 'hidden sm:block',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={[
                    'mx-2 h-0.5 min-w-4 flex-1 rounded-full sm:mx-3',
                    index < current
                      ? 'bg-green-600 dark:bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-800',
                  ].join(' ')}
                  aria-hidden
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
