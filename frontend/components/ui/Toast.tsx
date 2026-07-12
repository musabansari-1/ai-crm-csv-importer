'use client'

import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from 'lucide-react'
import { useToast, type ToastItem, type ToastType } from '@/hooks/useToast'

const TYPE_STYLES: Record<
  ToastType,
  { shell: string; icon: typeof Info }
> = {
  success: {
    shell:
      'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100',
    icon: CheckCircle2,
  },
  error: {
    shell:
      'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100',
    icon: XCircle,
  },
  warning: {
    shell:
      'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100',
    icon: AlertTriangle,
  },
  info: {
    shell:
      'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
    icon: Info,
  },
}

interface ToastProps {
  item: ToastItem
  onDismiss: (id: string) => void
}

function Toast({ item, onDismiss }: ToastProps) {
  const [entered, setEntered] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const styles = TYPE_STYLES[item.type]
  const Icon = styles.icon

  useEffect(() => {
    const enterId = window.requestAnimationFrame(() => setEntered(true))
    return () => window.cancelAnimationFrame(enterId)
  }, [])

  useEffect(() => {
    if (item.duration <= 0) return
    const timer = window.setTimeout(() => {
      setLeaving(true)
    }, item.duration)
    return () => window.clearTimeout(timer)
  }, [item.duration, item.id])

  useEffect(() => {
    if (!leaving) return
    const timer = window.setTimeout(() => onDismiss(item.id), 200)
    return () => window.clearTimeout(timer)
  }, [leaving, item.id, onDismiss])

  return (
    <div
      role="status"
      className={`flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-lg border px-3 py-3 shadow-lg transition-all duration-200 ${styles.shell} ${
        entered && !leaving
          ? 'translate-y-0 opacity-100'
          : 'translate-y-2 opacity-0'
      }`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p className="flex-1 text-sm font-medium">{item.message}</p>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => setLeaving(true)}
        className="rounded p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}

export function ToastViewport() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2"
      aria-live="polite"
    >
      {toasts.map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <Toast item={item} onDismiss={dismiss} />
        </div>
      ))}
    </div>
  )
}
