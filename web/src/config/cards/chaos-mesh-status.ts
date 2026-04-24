import type { UnifiedCardConfig } from '../../lib/unified/types'

export const chaosMeshStatusConfig: UnifiedCardConfig = {
  type: 'chaos_mesh_status',
  category: 'runtime',
  icon: 'Zap',
  emptyState: { 
    icon: 'AlertCircle',
    title: 'Chaos Mesh not detected',
    message: 'No PodChaos or Workflow resources found.',
    variant: 'neutral' 
  },
  loadingState: { 
    rows: 4,
    type: 'list',
    showHeader: true
  },
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'namespace', label: 'Namespace' },
    { key: 'kind', label: 'Kind' },
    { key: 'phase', label: 'Phase' },
  ],
}
