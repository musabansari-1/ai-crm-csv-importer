import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { CRMStatus } from '@/types'

const CASES: Array<{ status: CRMStatus; label: string }> = [
  { status: 'GOOD_LEAD_FOLLOW_UP', label: 'Good Lead' },
  { status: 'DID_NOT_CONNECT', label: 'Did Not Connect' },
  { status: 'BAD_LEAD', label: 'Bad Lead' },
  { status: 'SALE_DONE', label: 'Sale Done' },
]

describe('StatusBadge', () => {
  it.each(CASES)('renders $label for $status', ({ status, label }) => {
    render(<StatusBadge status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
    expect(screen.getByLabelText(`Status: ${label}`)).toBeInTheDocument()
  })

  it('empty status renders "—"', () => {
    render(<StatusBadge status="" />)
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.getByLabelText('Status: none')).toBeInTheDocument()
  })
})
