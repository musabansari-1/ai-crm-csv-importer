import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DropZone } from '@/components/upload/DropZone'

describe('DropZone', () => {
  it('renders idle state', () => {
    render(
      <DropZone onFileAccepted={vi.fn()} onError={vi.fn()} />
    )

    expect(
      screen.getByText('Drag & drop your CSV here')
    ).toBeInTheDocument()
    expect(screen.getByText('or click to browse')).toBeInTheDocument()
  })

  it('shows error state when invalid file is selected', () => {
    const onError = vi.fn()
    const onFileAccepted = vi.fn()

    const { container } = render(
      <DropZone onFileAccepted={onFileAccepted} onError={onError} />
    )

    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    // Empty file fails validation (userEvent.upload may skip non-accept files)
    const invalid = new File([], 'empty.csv', { type: 'text/csv' })

    fireEvent.change(input, { target: { files: [invalid] } })

    expect(onError).toHaveBeenCalledWith('File is empty')
    expect(screen.getByText('Upload failed')).toBeInTheDocument()
    expect(screen.getByText('File is empty')).toBeInTheDocument()
    expect(onFileAccepted).not.toHaveBeenCalled()
  })

  it('file input accepts only .csv', () => {
    const { container } = render(
      <DropZone onFileAccepted={vi.fn()} onError={vi.fn()} />
    )

    const input = container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement

    expect(input).toBeTruthy()
    expect(input.accept).toMatch(/\.csv/)
  })
})
