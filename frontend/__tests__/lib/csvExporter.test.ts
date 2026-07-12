import { describe, expect, it } from 'vitest'
import { escapeCSVCell, recordsToCSV } from '@/lib/csvExporter'
import type { CRMRecord } from '@/types'

function emptyRecord(overrides: Partial<CRMRecord> = {}): CRMRecord {
  return {
    created_at: '',
    name: '',
    email: '',
    country_code: '',
    mobile_without_country_code: '',
    company: '',
    city: '',
    state: '',
    country: '',
    lead_owner: '',
    crm_status: '',
    crm_note: '',
    data_source: '',
    possession_time: '',
    description: '',
    ...overrides,
  }
}

const HEADER_LINE =
  'created_at,name,email,country_code,mobile_without_country_code,company,city,state,country,lead_owner,crm_status,crm_note,data_source,possession_time,description'

describe('csvExporter', () => {
  it('exports correct headers', () => {
    const csv = recordsToCSV([])
    expect(csv.split('\n')[0]).toBe(HEADER_LINE)
  })

  it('escapes commas inside cell values', () => {
    expect(escapeCSVCell('Doe, John')).toBe('"Doe, John"')

    const csv = recordsToCSV([
      emptyRecord({ name: 'Doe, John', email: 'a@b.com' }),
    ])
    expect(csv).toContain('"Doe, John"')
  })

  it('escapes double-quotes inside cell values', () => {
    expect(escapeCSVCell('He said "hi"')).toBe('"He said ""hi"""')

    const csv = recordsToCSV([
      emptyRecord({ crm_note: 'He said "hi"' }),
    ])
    expect(csv).toContain('"He said ""hi"""')
  })

  it('exports headers only for an empty array', () => {
    const csv = recordsToCSV([])
    expect(csv).toBe(HEADER_LINE)
    expect(csv.split('\n')).toHaveLength(1)
  })
})
