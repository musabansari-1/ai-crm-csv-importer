import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-50">
            GrowEasy
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            CSV Importer
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
