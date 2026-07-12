'use client'

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration: number
}

interface ToastContextValue {
  toasts: ToastItem[]
  toast: (message: string, type?: ToastType, duration?: number) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DEFAULT_DURATION = 4000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      duration: number = DEFAULT_DURATION
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      setToasts((prev) => [...prev, { id, message, type, duration }])
    },
    []
  )

  const value = useMemo(
    () => ({ toasts, toast, dismiss }),
    [toasts, toast, dismiss]
  )

  return createElement(ToastContext.Provider, { value }, children)
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
