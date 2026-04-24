import type { UnifiedCardConfig } from './types'

export const chaosMeshStatusConfig: UnifiedCardConfig = {
  type: 'chaos_mesh_status',
  category: 'runtime',
  icon: 'Zap',
  emptyState: { message: 'Chaos Mesh not detected' },
  loadingState: { message: 'Loading Chaos Mesh status...' },
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'namespace', label: 'Namespace' },
    { key: 'kind', label: 'Kind' },
    { key: 'phase', label: 'Phase' },
  ],
}
