import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ResultsSummary } from '@/components/results/ResultsSummary'

describe('ResultsSummary', () => {
  it('shows correct imported/skipped/total counts', () => {
    render(
      <ResultsSummary imported={10} skipped={2} total={12} />
    )

    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Imported')).toBeInTheDocument()
    expect(screen.getByText('Skipped')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
  })

  it('hides skipped section when skipped === 0', () => {
    render(
      <ResultsSummary imported={5} skipped={0} total={5} />
    )

    expect(
      screen.queryByText('View skipped records')
    ).not.toBeInTheDocument()
  })

  it('shows expandable skipped section when skipped > 0', async () => {
    const user = userEvent.setup()

    render(
      <ResultsSummary
        imported={3}
        skipped={1}
        total={4}
        skippedRecords={[
          {
            row: 5,
            reason: 'No email or mobile number found',
            raw: { Notes: 'Call back later' },
          },
        ]}
      />
    )

    const toggle = screen.getByRole('button', {
      name: 'View skipped records',
    })
    expect(toggle).toBeInTheDocument()

    await user.click(toggle)

    expect(screen.getByText(/Row 5/)).toBeInTheDocument()
    expect(
      screen.getByText(/No email or mobile number found/)
    ).toBeInTheDocument()
  })
})
