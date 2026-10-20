export type SyncStrategy = 'overwrite' | 'create-only' | 'merge-lines'

export interface ManifestEntry {
  src: string
  dest: string
  strategy: SyncStrategy
}

export interface Manifest {
  name: string
  version: string
  entries: ManifestEntry[]
}

export interface LabelDefinition {
  name: string
  color: string
  description: string
}

export interface RulesetDefinition {
  name: string
  target: string
  enforcement: string
  id?: number
  [key: string]: unknown
}
