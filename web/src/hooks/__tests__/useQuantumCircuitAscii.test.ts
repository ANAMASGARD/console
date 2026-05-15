import { vi, describe, it, expect, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useQuantumCircuitAscii, DEMO_QUANTUM_CIRCUIT } from '../useCachedQuantum'
import { useCache } from '../../lib/cache'

vi.mock('../../lib/cache', () => ({ useCache: vi.fn() }))
vi.mock('../../lib/quantum/pollingContext', () => ({
  isGlobalQuantumPollingPaused: vi.fn().mockReturnValue(false),
}))

beforeEach(() => {
  vi.resetAllMocks()
})

describe('useQuantumCircuitAscii', () => {
  it('returns disabled result with data null when isAuthenticated is false', () => {
    const mockRefetch = vi.fn()
    vi.mocked(useCache).mockReturnValue({
      data: null,
      isLoading: false,
      isRefreshing: false,
      isDemoFallback: false,
      isFailed: false,
      error: null,
      consecutiveFailures: 0,
      lastRefresh: null,
      refetch: mockRefetch,
    })

    const { result } = renderHook(() =>
      useQuantumCircuitAscii({ isAuthenticated: false }),
    )

    expect(result.current.data).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isRefreshing).toBe(false)
    expect(result.current.isDemoData).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.isFailed).toBe(false)
    expect(result.current.consecutiveFailures).toBe(0)
    expect(result.current.lastRefresh).toBeNull()
    expect(typeof result.current.refetch).toBe('function')
  })

  it('returns DEMO_QUANTUM_CIRCUIT and isDemoData true in demo mode', () => {
    vi.mocked(useCache).mockReturnValueOnce({
      data: DEMO_QUANTUM_CIRCUIT,
      isLoading: false,
      isRefreshing: false,
      isDemoFallback: true,
      isFailed: false,
      error: null,
      consecutiveFailures: 0,
      lastRefresh: null,
      refetch: vi.fn(),
    })

    const { result } = renderHook(() =>
      useQuantumCircuitAscii({ isAuthenticated: true }),
    )

    expect(result.current.isDemoData).toBe(true)
    expect(result.current.data).not.toBeNull()
    expect(result.current.data?.circuitAscii).toMatch(/[┌─┤]/)
  })
})
