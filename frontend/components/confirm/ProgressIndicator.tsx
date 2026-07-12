'use client'

import { useEffect, useState } from 'react'
import { Bot, CheckCircle2, Upload } from 'lucide-react'

interface ProgressIndicatorProps {
  attempt: number
}

// Stage thresholds used only for label/icon selection (not shown in UI)
const STAGES = [
  { label: 'Uploading file…', Icon: Upload },
  { label: 'AI is mapping your fields…', Icon: Bot },
  { label: 'Finalizing records…', Icon: CheckCircle2 },
] as const

function stageForProgress(progress: number) {
  // 0–30 → upload, 30–80 → AI mapping, 80–100 → finalize
  if (progress < 30) return STAGES[0]
  if (progress < 80) return STAGES[1]
  return STAGES[2]
}

export function ProgressIndicator({ attempt }: ProgressIndicatorProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    setProgress(0)
    // Simulated progress — not tied to real upload bytes
    const id = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 96) return prev
        // Ease: faster early, slower near the end
        const step = prev < 30 ? 2.2 : prev < 80 ? 1.4 : 0.6
        return Math.min(96, prev + step)
      })
    }, 120)

    return () => window.clearInterval(id)
  }, [attempt])

  const stage = stageForProgress(progress)
  const StageIcon = stage.Icon

  return (
    <div
      className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/40"
      role="status"
      aria-live="polite"
      aria-label={stage.label}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StageIcon
            className="h-5 w-5 text-blue-600 dark:text-blue-400"
            aria-hidden
          />
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            {stage.label}
          </p>
        </div>

        {attempt > 1 && (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            Attempt {attempt} of 3
          </span>
        )}
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900/60">
        <div
          className="h-full rounded-full bg-blue-600 transition-[width] duration-150 ease-out dark:bg-blue-400"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-2 text-right text-xs tabular-nums text-blue-700 dark:text-blue-300">
        {Math.round(progress)}%
      </p>
    </div>
  )
}
