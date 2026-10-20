#!/usr/bin/env bun
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { $ } from 'bun'

async function parseTomlFile(filePath: string): Promise<Record<string, unknown>> {
  const jsonStr =
    await $`python3 -c "import tomllib, json, sys; print(json.dumps(tomllib.load(open(sys.argv[1], 'rb'))))" ${filePath}`.text()
  return JSON.parse(jsonStr) as Record<string, unknown>
}

async function getLocalVersion(): Promise<string> {
  const rootDir = process.cwd()

  // 1. Node / Bun project (Native JSON parser)
  const pkgPath = resolve(rootDir, 'package.json')
  if (existsSync(pkgPath)) {
    const pkg = (await Bun.file(pkgPath).json()) as { version?: string }
    if (pkg.version) return String(pkg.version).trim()
  }

  // 2. dist-workspace.toml (Standard TOML parser)
  const distWorkspacePath = resolve(rootDir, 'dist-workspace.toml')
  if (existsSync(distWorkspacePath)) {
    const toml = (await parseTomlFile(distWorkspacePath)) as {
      package?: { version?: string }
    }
    if (toml.package?.version) return String(toml.package.version).trim()
  }

  // 3. Rust project (Cargo official metadata AST parser)
  const cargoPath = resolve(rootDir, 'Cargo.toml')
  if (existsSync(cargoPath)) {
    const raw = await $`cargo metadata --no-deps --format-version 1`.text()
    const meta = JSON.parse(raw) as { packages: Array<{ version?: string }> }
    const ver = meta.packages[0]?.version
    if (ver) return String(ver).trim()
  }

  // 4. Python project (Standard TOML parser)
  const pyprojectPath = resolve(rootDir, 'pyproject.toml')
  if (existsSync(pyprojectPath)) {
    const toml = (await parseTomlFile(pyprojectPath)) as {
      project?: { version?: string }
    }
    if (toml.project?.version) return String(toml.project.version).trim()
  }

  throw new Error(
    '[release] error: unsupported project type. no valid package.json, dist-workspace.toml, Cargo.toml, or pyproject.toml found.',
  )
}

async function getRemoteLatestTag(): Promise<string | null> {
  await $`git fetch --tags origin`.quiet()
  const raw = await $`git tag -l --sort=-v:refname`.text()
  const tags = raw
    .split('\n')
    .map((t) => t.trim())
    .filter(Boolean)
  return tags[0] ?? null
}

function isVersionGreater(newVer: string, baseVer: string): boolean {
  const p1 = newVer.replace(/^v/, '').split('.').map(Number)
  const p2 = baseVer.replace(/^v/, '').split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const n1 = p1[i] ?? 0
    const n2 = p2[i] ?? 0
    if (n1 > n2) return true
    if (n1 < n2) return false
  }
  return false
}

async function main() {
  const status = (await $`git status --porcelain`.text()).trim()
  if (status.length > 0) {
    console.error('[release] error: working tree has uncommitted changes. aborting.')
    process.exit(1)
  }

  const branch = (await $`git branch --show-current`.text()).trim()
  if (branch !== 'main' && branch !== 'master') {
    console.error(`[release] error: must be on main branch to release (current: ${branch}).`)
    process.exit(1)
  }

  const localVersion = await getLocalVersion()
  const newTag = `v${localVersion}`
  console.log(`[release] detected local version: ${localVersion} (${newTag})`)

  const remoteLatestTag = await getRemoteLatestTag()
  if (remoteLatestTag) {
    console.log(`[release] latest remote tag: ${remoteLatestTag}`)
    if (!isVersionGreater(newTag, remoteLatestTag)) {
      console.error(
        `[release] error: local version (${localVersion}) must be strictly greater than remote latest tag (${remoteLatestTag}). bump version first.`,
      )
      process.exit(1)
    }
  }

  console.log(`[release] creating tag: ${newTag}...`)
  await $`git tag -a ${newTag} -m "Release ${newTag}"`

  console.log(`[release] pushing tag ${newTag} to origin...`)
  await $`git push origin ${newTag}`

  console.log(`[release] successfully published tag ${newTag}. release workflow triggered.`)
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
