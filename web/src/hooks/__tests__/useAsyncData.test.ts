import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useAsyncData } from '../useAsyncData'

describe('useAsyncData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resolves data on success', async () => {
    const fetcher = vi.fn().mockResolvedValue('hello')
    const { result } = renderHook(() =>
      useAsyncData(fetcher, []),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBe('hello')
    expect(result.current.error).toBeNull()
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('sets error on failure', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('fetch failed'))
    const { result } = renderHook(() =>
      useAsyncData(fetcher, []),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toBeNull()
    expect(result.current.error).toBe('fetch failed')
  })

  it('uses initialData before first fetch completes', () => {
    const fetcher = vi.fn().mockImplementation(
      () => new Promise(() => {}),
    )
    const { result } = renderHook(() =>
      useAsyncData(fetcher, [], { initialData: 'cached' }),
    )

    expect(result.current.data).toBe('cached')
    expect(result.current.loading).toBe(true)
  })

  it('does not auto-fetch when enabled is false', async () => {
    const fetcher = vi.fn().mockResolvedValue('manual')
    const { result } = renderHook(() =>
      useAsyncData(fetcher, [], { enabled: false }),
    )

    await waitFor(() => {
      expect(fetcher).not.toHaveBeenCalled()
    })

    expect(result.current.data).toBeNull()
    expect(result.current.loading).toBe(false)

    act(() => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(result.current.data).toBe('manual')
    })

    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it('refetch triggers another fetch without returning cleanup to caller', async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce('first')
      .mockResolvedValueOnce('second')
    const { result } = renderHook(() =>
      useAsyncData(fetcher, [], { enabled: false, initialData: null }),
    )

    act(() => {
      result.current.refetch()
    })

    await waitFor(() => {
      expect(result.current.data).toBe('first')
    })

    act(() => {
      const ret = result.current.refetch()
      expect(ret).toBeUndefined()
    })

    await waitFor(() => {
      expect(result.current.data).toBe('second')
    })

    expect(fetcher).toHaveBeenCalledTimes(2)
  })

  it('ignores stale results after unmount', async () => {
    let resolveFetch: (value: string) => void = () => {}
    const fetcher = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveFetch = resolve
        }),
    )

    const { result, unmount } = renderHook(() =>
      useAsyncData(fetcher, []),
    )

    await waitFor(() => {
      expect(result.current.loading).toBe(true)
    })

    unmount()
    resolveFetch('late')

    await new Promise((r) => setTimeout(r, 10))
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})
