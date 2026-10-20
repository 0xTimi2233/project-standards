import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Manifest, ManifestEntry, SupportedStack, Visibility } from '@/types.ts'

const currentDir = dirname(fileURLToPath(import.meta.url))
export const ROOT_DIR = resolve(currentDir, '..')
export const TEMPLATES_DIR = resolve(ROOT_DIR, 'templates')

export const CORE_ENTRIES: ManifestEntry[] = [
  {
    src: 'templates/core/.gitmessage',
    dest: '.gitmessage',
    strategy: 'overwrite',
  },
  {
    src: 'templates/core/.github/ISSUE_TEMPLATE',
    dest: '.github/ISSUE_TEMPLATE',
    strategy: 'overwrite',
  },
  {
    src: 'templates/core/.github/PULL_REQUEST_TEMPLATE.md',
    dest: '.github/PULL_REQUEST_TEMPLATE.md',
    strategy: 'overwrite',
  },
  {
    src: 'templates/core/.github/labels.json',
    dest: '.github/labels.json',
    strategy: 'overwrite',
  },
  {
    src: 'templates/core/.github/ruleset.json',
    dest: '.github/ruleset.json',
    strategy: 'overwrite',
  },
  {
    src: 'templates/core/.github/workflows/cache-cleanup.yml',
    dest: '.github/workflows/cache-cleanup.yml',
    strategy: 'overwrite',
  },
  {
    src: 'templates/core/.github/workflows/security.yml',
    dest: '.github/workflows/security.yml',
    strategy: 'overwrite',
  },
  {
    src: 'templates/core/renovate.json',
    dest: 'renovate.json',
    strategy: 'create-only',
  },
  {
    src: 'templates/core/CONTRIBUTING.md',
    dest: 'CONTRIBUTING.md',
    strategy: 'create-only',
  },
  {
    src: 'templates/core/SECURITY.md',
    dest: 'SECURITY.md',
    strategy: 'create-only',
  },
  {
    src: 'templates/core/.markdownlint-cli2.jsonc',
    dest: '.markdownlint-cli2.jsonc',
    strategy: 'create-only',
  },
  {
    src: 'templates/core/.gitignore',
    dest: '.gitignore',
    strategy: 'merge-lines',
  },
]

export const STACK_ENTRIES: Record<SupportedStack, ManifestEntry[]> = {
  rust: [
    {
      src: 'templates/stacks/rust/.github/workflows/ci.yml',
      dest: '.github/workflows/ci.yml',
      strategy: 'overwrite',
    },
    {
      src: 'templates/stacks/rust/.github/workflows/release.yml',
      dest: '.github/workflows/release.yml',
      strategy: 'overwrite',
    },
    {
      src: 'templates/stacks/rust/rust-toolchain.toml',
      dest: 'rust-toolchain.toml',
      strategy: 'create-only',
    },
    {
      src: 'templates/stacks/rust/deny.toml',
      dest: 'deny.toml',
      strategy: 'create-only',
    },
    {
      src: 'templates/stacks/rust/.gitignore',
      dest: '.gitignore',
      strategy: 'merge-lines',
    },
  ],
  bun: [
    {
      src: 'templates/stacks/bun/.github/workflows/ci.yml',
      dest: '.github/workflows/ci.yml',
      strategy: 'overwrite',
    },
    {
      src: 'templates/stacks/bun/.github/workflows/release.yml',
      dest: '.github/workflows/release.yml',
      strategy: 'overwrite',
    },
    {
      src: 'templates/stacks/bun/biome.template.json',
      dest: 'biome.json',
      strategy: 'create-only',
    },
    {
      src: 'templates/stacks/bun/.gitignore',
      dest: '.gitignore',
      strategy: 'merge-lines',
    },
  ],
  uv: [
    {
      src: 'templates/stacks/uv/.github/workflows/ci.yml',
      dest: '.github/workflows/ci.yml',
      strategy: 'overwrite',
    },
    {
      src: 'templates/stacks/uv/.github/workflows/release.yml',
      dest: '.github/workflows/release.yml',
      strategy: 'overwrite',
    },
    {
      src: 'templates/stacks/uv/ruff.toml',
      dest: 'ruff.toml',
      strategy: 'create-only',
    },
    {
      src: 'templates/stacks/uv/.gitignore',
      dest: '.gitignore',
      strategy: 'merge-lines',
    },
  ],
}

export const VISIBILITY_ENTRIES: Record<Visibility, ManifestEntry[]> = {
  public: [
    {
      src: 'templates/visibility/public/LICENSE',
      dest: 'LICENSE',
      strategy: 'create-only',
    },
  ],
  private: [
    {
      src: 'templates/visibility/private/LICENSE',
      dest: 'LICENSE',
      strategy: 'create-only',
    },
  ],
}

export function buildManifest(stack?: SupportedStack, visibility?: Visibility): Manifest {
  const entries: ManifestEntry[] = [...CORE_ENTRIES]

  if (stack && STACK_ENTRIES[stack]) {
    entries.push(...STACK_ENTRIES[stack])
  }

  if (visibility && VISIBILITY_ENTRIES[visibility]) {
    entries.push(...VISIBILITY_ENTRIES[visibility])
  }

  return {
    name: 'project-standards-manifest',
    version: '0.2.0',
    entries,
  }
}
