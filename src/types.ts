export type SupportedStack = 'rust' | 'bun' | 'uv'

export type Visibility = 'public' | 'private'

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

export interface InitOptions {
  stack?: SupportedStack
  visibility?: Visibility
  silent?: boolean
}

export interface SyncOptions {
  visibility?: Visibility
  silent?: boolean
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
