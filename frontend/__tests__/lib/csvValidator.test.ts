import { describe, expect, it } from 'vitest'
import { validateCSVFile } from '@/lib/csvValidator'

function makeFile(
  name: string,
  size: number,
  type = 'text/csv'
): File {
  // File size is derived from blob content; pad to requested size
  const content = size === 0 ? '' : 'x'.repeat(size)
  return new File([content], name, { type })
}

describe('validateCSVFile', () => {
  it('accepts a valid .csv file', () => {
    const file = makeFile('leads.csv', 128, 'text/csv')
    expect(validateCSVFile(file)).toEqual({ valid: true })
  })

  it('rejects a non-CSV file (.xlsx) with reason', () => {
    const file = makeFile(
      'leads.xlsx',
      128,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    const result = validateCSVFile(file)
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.reason).toBe('Only .csv files are supported')
    }
  })

  it('rejects a file over 10MB', () => {
    const overLimit = 10 * 1024 * 1024 + 1
    const file = makeFile('huge.csv', overLimit, 'text/csv')
    const result = validateCSVFile(file)
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.reason).toBe('File too large — maximum size is 10MB')
    }
  })

  it('rejects an empty file', () => {
    const file = makeFile('empty.csv', 0, 'text/csv')
    const result = validateCSVFile(file)
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.reason).toBe('File is empty')
    }
  })
})
