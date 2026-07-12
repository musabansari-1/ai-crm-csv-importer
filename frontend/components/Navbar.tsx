import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex h-14 min-w-0 max-w-6xl items-center justify-between gap-3 px-3 sm:px-6">
        <div className="flex min-w-0 items-baseline gap-1.5 sm:gap-2">
          <span className="truncate text-base font-bold text-gray-900 dark:text-gray-50 sm:text-lg">
            GrowEasy
          </span>
          <span className="truncate text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            <span className="sm:hidden">CSV</span>
            <span className="hidden sm:inline">CSV Importer</span>
          </span>
        </div>
        <div className="shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
