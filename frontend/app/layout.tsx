import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/Navbar'
import { Providers } from '@/components/ui/Providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'GrowEasy CSV Importer',
  description:
    'Upload any CSV and let AI intelligently map your leads into GrowEasy CRM format.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen transition-colors">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
