'use client'

import { useCallback, useRef, useState } from 'react'
import { parseCSVStream } from '@/lib/csvParser'

export interface CSVParserState {
  status: 'idle' | 'parsing' | 'done' | 'error'
  rows: Record<string, string>[]
  headers: string[]
  parsedCount: number
  error: string | null
}

const INITIAL_STATE: CSVParserState = {
  status: 'idle',
  rows: [],
  headers: [],
  parsedCount: 0,
  error: null,
}

export function useCSVParser() {
  const [state, setState] = useState<CSVParserState>(INITIAL_STATE)
  const parseGeneration = useRef(0)

  const reset = useCallback(() => {
    parseGeneration.current += 1
    setState(INITIAL_STATE)
  }, [])

  const parseFile = useCallback((file: File) => {
    const generation = ++parseGeneration.current

    setState({
      status: 'parsing',
      rows: [],
      headers: [],
      parsedCount: 0,
      error: null,
    })

    parseCSVStream(
      file,
      (row) => {
        if (generation !== parseGeneration.current) return
        // Append each row as it streams in (not batched at the end)
        setState((prev) => ({
          ...prev,
          rows: [...prev.rows, row],
          parsedCount: prev.parsedCount + 1,
          // Seed headers from first row keys if meta has not filled them yet
          headers:
            prev.headers.length > 0 ? prev.headers : Object.keys(row),
        }))
      },
      (headers, total) => {
        if (generation !== parseGeneration.current) return
        // Headers-only (total === 0): status is 'done' with empty rows — not error
        setState((prev) => ({
          ...prev,
          status: 'done',
          headers: headers.length > 0 ? headers : prev.headers,
          parsedCount: total,
          error: null,
        }))
      },
      (err) => {
        if (generation !== parseGeneration.current) return
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: err.message,
        }))
      }
    )
  }, [])

  return {
    ...state,
    parseFile,
    reset,
  }
}
