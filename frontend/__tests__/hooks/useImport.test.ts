import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useImport } from '@/hooks/useImport'
import type { CRMRecord, ImportResult } from '@/types'

vi.mock('@/lib/api', () => ({
  importCSV: vi.fn(),
  importCSVStream: vi.fn(),
}))

import { importCSV, importCSVStream } from '@/lib/api'

const mockImportCSV = vi.mocked(importCSV)
const mockImportCSVStream = vi.mocked(importCSVStream)

const sampleRecord: CRMRecord = {
  created_at: '2026-01-01T00:00:00.000Z',
  name: 'John Doe',
  email: 'john.doe@example.com',
  country_code: '+91',
  mobile_without_country_code: '9876543210',
  company: 'GrowEasy',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  lead_owner: 'Agent',
  crm_status: 'GOOD_LEAD_FOLLOW_UP',
  crm_note: '',
  data_source: 'leads_on_demand',
  possession_time: '',
  description: '',
}

const successResult: ImportResult = {
  records: [sampleRecord],
  skipped: [],
  total_processed: 1,
}

function makeFile(): File {
  return new File(['name\nJohn'], 'leads.csv', { type: 'text/csv' })
}

describe('useImport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts in idle state', () => {
    const { result } = renderHook(() => useImport())
    expect(result.current.status).toBe('idle')
    expect(result.current.result).toBeNull()
    expect(result.current.streamingRecords).toEqual([])
    expect(result.current.error).toBeNull()
    expect(result.current.attempt).toBe(0)
  })

  it('sets loading on startImport', async () => {
    let resolveStream: (() => void) | undefined
    mockImportCSVStream.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveStream = resolve
        })
    )

    const { result } = renderHook(() => useImport())

    act(() => {
      void result.current.startImport(makeFile())
    })

    await waitFor(() => {
      expect(result.current.status).toBe('loading')
    })
    expect(result.current.attempt).toBe(1)

    act(() => {
      resolveStream?.()
    })
  })

  it('sets success with result on resolve', async () => {
    mockImportCSVStream.mockImplementation(
      async (_file, onBatch, onSkipped, onComplete) => {
        onBatch([sampleRecord])
        onSkipped([])
        onComplete({ total_processed: 1 })
      }
    )

    const { result } = renderHook(() => useImport())

    await act(async () => {
      await result.current.startImport(makeFile())
    })

    expect(result.current.status).toBe('success')
    expect(result.current.result).toEqual({
      records: [sampleRecord],
      skipped: [],
      total_processed: 1,
    })
    expect(result.current.streamingRecords).toHaveLength(1)
  })

  it('sets error after 3 failed attempts', async () => {
    vi.useFakeTimers()

    mockImportCSVStream.mockImplementation(async () => {
      throw new Error('stream down')
    })
    mockImportCSV.mockRejectedValue(new Error('api down'))

    const { result } = renderHook(() => useImport())

    const promise = act(async () => {
      const run = result.current.startImport(makeFile())
      await vi.runAllTimersAsync()
      await run
    })

    await promise

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBeTruthy()
    expect(result.current.attempt).toBe(3)
    expect(mockImportCSVStream).toHaveBeenCalledTimes(3)
  })

  it('reset() returns to idle', async () => {
    mockImportCSVStream.mockImplementation(
      async (_file, onBatch, _onSkipped, onComplete) => {
        onBatch([sampleRecord])
        onComplete({ total_processed: 1 })
      }
    )

    const { result } = renderHook(() => useImport())

    await act(async () => {
      await result.current.startImport(makeFile())
    })
    expect(result.current.status).toBe('success')

    act(() => {
      result.current.reset()
    })

    expect(result.current.status).toBe('idle')
    expect(result.current.result).toBeNull()
    expect(result.current.streamingRecords).toEqual([])
    expect(result.current.error).toBeNull()
    expect(result.current.attempt).toBe(0)
  })
})
