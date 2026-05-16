import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'

const mockUseQuantumQubitGridData = vi.fn()
vi.mock('../../../../hooks/useCachedQuantum', () => ({
  useQuantumQubitGridData: (...args: unknown[]) => mockUseQuantumQubitGridData(...args),
  DEMO_QUANTUM_QUBITS: { num_qubits: 5, pattern: '01010' },
  QUANTUM_QUBIT_GRID_DEFAULT_POLL_MS: 5000,
}))

vi.mock('../../../../lib/demoMode', () => ({
  isQuantumForcedToDemo: vi.fn().mockReturnValue(false),
}))

const mockUseAuth = vi.fn()
vi.mock('../../../../lib/auth', () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock('dompurify', () => ({
  default: {
    sanitize: (svg: string) => svg,
  },
}))

const mockUseReportCardDataState = vi.fn()
vi.mock('../../CardDataContext', () => ({
  useReportCardDataState: (opts: unknown) => mockUseReportCardDataState(opts),
  useCardLoadingState: vi.fn().mockReturnValue({ showSkeleton: false }),
}))

import { QuantumQubitGrid } from '../QuantumQubitGrid'

function defaultAuth() {
  return { isAuthenticated: true, isLoading: false, login: vi.fn(), logout: vi.fn() }
}

function defaultHook(overrides: Record<string, unknown> = {}) {
  return {
    data: null,
    isLoading: false,
    isRefreshing: false,
    isDemoData: false,
    isFailed: false,
    consecutiveFailures: 0,
    lastRefresh: null,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  }
}

describe('QuantumQubitGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue(defaultAuth())
    mockUseQuantumQubitGridData.mockReturnValue(defaultHook())
    mockUseReportCardDataState.mockReturnValue(undefined)
  })

  it('renders qubit count, pattern, and version in info box when qubits data is present', () => {
    mockUseQuantumQubitGridData.mockReturnValue(
      defaultHook({
        data: {
          qubits: { num_qubits: 5, pattern: '01010' },
          versionInfo: {
            version: '2.1.0',
            commit: 'abc123',
            timestamp: '2026-05-01T00:00:00Z',
          },
        },
      }),
    )
    const { container } = render(<QuantumQubitGrid />)

    const infoBox = container.querySelector('.bg-blue-50')
    expect(infoBox).toBeTruthy()
    expect(within(infoBox as HTMLElement).getByText('5', { exact: true })).toBeTruthy()
    expect(within(infoBox as HTMLElement).getByText('01010', { exact: true })).toBeTruthy()
    expect(within(infoBox as HTMLElement).getByText('2.1.0', { exact: true })).toBeTruthy()

    expect(screen.getByText('Quantum Qubit Display -- Latest Run')).toBeTruthy()
  })

  it('renders logo fallback with num_qubits=8 and empty pattern when data is null', () => {
    mockUseQuantumQubitGridData.mockReturnValue(defaultHook({ data: null }))
    const { container } = render(<QuantumQubitGrid />)

    expect(screen.getByText('Quantum Qubit Display -- Latest Run')).toBeTruthy()

    const infoBox = container.querySelector('.bg-blue-50')
    expect(infoBox).toBeTruthy()
    expect(within(infoBox as HTMLElement).getByText('8', { exact: true })).toBeTruthy()

    expect(container.querySelector('svg')).toBeTruthy()

    expect(screen.queryByText('01010')).toBeNull()
  })
})
