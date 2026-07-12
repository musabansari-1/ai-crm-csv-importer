'use client'

import { useCallback, useRef, useState } from 'react'
import { importCSV, importCSVStream } from '@/lib/api'
import type {
  CRMRecord,
  ImportResult,
  ImportStatus,
  SkippedRecord,
} from '@/types'

export interface ImportState {
  status: ImportStatus
  result: ImportResult | null
  streamingRecords: CRMRecord[]
  error: string | null
  attempt: number
}

const INITIAL_STATE: ImportState = {
  status: 'idle',
  result: null,
  streamingRecords: [],
  error: null,
  attempt: 0,
}

const MAX_ATTEMPTS = 3

function backoffMs(attempt: number): number {
  // attempt 1 → 1s, 2 → 2s, 3 → 4s (used before the next try)
  return 2 ** (attempt - 1) * 1000
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function useImport() {
  const [state, setState] = useState<ImportState>(INITIAL_STATE)
  const generationRef = useRef(0)
  const fileRef = useRef<File | null>(null)
  const streamingRef = useRef<CRMRecord[]>([])
  const skippedRef = useRef<SkippedRecord[]>([])

  const reset = useCallback(() => {
    generationRef.current += 1
    fileRef.current = null
    streamingRef.current = []
    skippedRef.current = []
    setState(INITIAL_STATE)
  }, [])

  const runImportAttempt = useCallback(
    async (file: File, generation: number): Promise<void> => {
      streamingRef.current = []
      skippedRef.current = []

      const runStream = (): Promise<void> =>
        new Promise((resolve, reject) => {
          importCSVStream(
            file,
            (records) => {
              if (generation !== generationRef.current) return
              streamingRef.current = [...streamingRef.current, ...records]
              setState((prev) => ({
                ...prev,
                streamingRecords: streamingRef.current,
              }))
            },
            (skipped) => {
              if (generation !== generationRef.current) return
              skippedRef.current = [...skippedRef.current, ...skipped]
            },
            (summary) => {
              if (generation !== generationRef.current) return
              const result: ImportResult = {
                records: streamingRef.current,
                skipped: skippedRef.current,
                total_processed: summary.total_processed,
              }
              setState((prev) => ({
                ...prev,
                status: 'success',
                result,
                streamingRecords: streamingRef.current,
                error: null,
              }))
              resolve()
            },
            (err) => {
              reject(err)
            }
          ).catch(reject)
        })

      try {
        await runStream()
      } catch (streamErr) {
        // Fall back to non-streaming only if nothing arrived yet
        if (streamingRef.current.length > 0) {
          throw streamErr
        }
        const result = await importCSV(file)
        if (generation !== generationRef.current) return
        streamingRef.current = result.records
        skippedRef.current = result.skipped
        setState((prev) => ({
          ...prev,
          status: 'success',
          result,
          streamingRecords: result.records,
          error: null,
        }))
      }
    },
    []
  )

  const startImport = useCallback(
    async (file: File): Promise<void> => {
      fileRef.current = file
      const generation = ++generationRef.current

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        if (generation !== generationRef.current) return

        setState({
          status: 'loading',
          result: null,
          streamingRecords: [],
          error: null,
          attempt,
        })
        streamingRef.current = []
        skippedRef.current = []

        try {
          await runImportAttempt(file, generation)
          return
        } catch (err) {
          if (generation !== generationRef.current) return

          const message =
            err instanceof Error ? err.message : 'Import failed'

          if (attempt >= MAX_ATTEMPTS) {
            setState((prev) => ({
              ...prev,
              status: 'error',
              error: message,
              streamingRecords: streamingRef.current,
            }))
            return
          }

          await sleep(backoffMs(attempt))
        }
      }
    },
    [runImportAttempt]
  )

  const retry = useCallback(async (): Promise<void> => {
    const file = fileRef.current
    if (!file) return
    await startImport(file)
  }, [startImport])

  return {
    ...state,
    startImport,
    reset,
    retry,
  }
}
