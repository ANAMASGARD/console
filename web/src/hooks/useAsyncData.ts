/**
 * Generic async data hook for drill-down views and cards.
 * Manages data/loading/error state with cancellation on unmount or dependency change.
 */
import { useState, useEffect, useCallback, type DependencyList } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export interface UseAsyncDataOptions<T> {
  /** Initial value before the first fetch (e.g. pod cache). */
  initialData?: T | null
  /** When false, skips auto-fetch on mount/deps change; use refetch() manually. Default true. */
  enabled?: boolean
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList,
  options?: UseAsyncDataOptions<T>,
): AsyncState<T> {
  const initialData = options?.initialData ?? null
  const enabled = options?.enabled !== false

  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = useCallback(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls invalidation via deps
  }, deps)

  useEffect(() => {
    if (!enabled) {
      return
    }
    return run()
  }, [run, enabled])

  const refetch = useCallback(() => {
    run()
  }, [run])

  return { data, loading, error, refetch }
}
