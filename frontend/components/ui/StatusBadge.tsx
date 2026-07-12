import type { CRMStatus } from '@/types'

interface StatusBadgeProps {
  status: CRMStatus | ''
}

const STATUS_CONFIG: Record<
  CRMStatus,
  { label: string; className: string }
> = {
  GOOD_LEAD_FOLLOW_UP: {
    label: 'Good Lead',
    className:
      'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  },
  DID_NOT_CONNECT: {
    label: 'Did Not Connect',
    className:
      'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  BAD_LEAD: {
    label: 'Bad Lead',
    className: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  },
  SALE_DONE: {
    label: 'Sale Done',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === '') {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-800 dark:text-gray-400">
        —
      </span>
    )
  }

  const config = STATUS_CONFIG[status]

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  )
}
