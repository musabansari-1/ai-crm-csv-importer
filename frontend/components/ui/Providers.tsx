'use client'

import { ThemeProvider } from '@/components/ui/ThemeProvider'
import { ToastViewport } from '@/components/ui/Toast'
import { ToastProvider } from '@/hooks/useToast'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        {children}
        <ToastViewport />
      </ToastProvider>
    </ThemeProvider>
  )
}
