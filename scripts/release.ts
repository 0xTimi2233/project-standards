#!/usr/bin/env bun
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { $ } from 'bun'

async function resolveProjectVersion(rootDir: string): Promise<string> {
  const pkgPath = resolve(rootDir, 'package.json')
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
    if (pkg.version) return String(pkg.version).trim()
  }

  const cargoPath = resolve(rootDir, 'Cargo.toml')
  if (existsSync(cargoPath)) {
    const content = await readFile(cargoPath, 'utf-8')
    const match = content.match(/\[package\][\s\S]*?version\s*=\s*"([^"]+)"/)
    if (match?.[1]) return match[1].trim()
  }

  const pyprojectPath = resolve(rootDir, 'pyproject.toml')
  if (existsSync(pyprojectPath)) {
    const content = await readFile(pyprojectPath, 'utf-8')
    const match = content.match(/version\s*=\s*"([^"]+)"/)
    if (match?.[1]) return match[1].trim()
  }

  throw new Error('unable to detect version from package.json, Cargo.toml, or pyproject.toml')
}

async function main() {
  const rootDir = process.cwd()

  // 1. 确保 Git 工作区整洁
  const status = (await $`git status --porcelain`.text()).trim()
  if (status.length > 0) {
    console.error('[release] error: working tree has uncommitted changes. aborting.')
    process.exit(1)
  }

  // 2. 确保在默认分支
  const currentBranch = (await $`git branch --show-current`.text()).trim()
  if (currentBranch !== 'main' && currentBranch !== 'master') {
    console.error(`[release] error: must be on main branch to release (current: ${currentBranch}).`)
    process.exit(1)
  }

  // 3. 自动探测版本号
  const version = await resolveProjectVersion(rootDir)
  const tag = `v${version}`
  console.log(`[release] detected project version: ${version} (tag: ${tag})`)

  // 4. 检查 Tag 是否已经存在
  const localTagExists = (await $`git tag -l ${tag}`.text()).trim().length > 0
  if (localTagExists) {
    console.error(`[release] error: tag ${tag} already exists locally. aborting.`)
    process.exit(1)
  }

  const remoteTagExists =
    (await $`git ls-remote --tags origin refs/tags/${tag}`.text()).trim().length > 0
  if (remoteTagExists) {
    console.error(`[release] error: tag ${tag} already exists on remote origin. aborting.`)
    process.exit(1)
  }

  // 5. 创建并推送 Tag
  console.log(`[release] creating annotated tag: ${tag}...`)
  await $`git tag -a ${tag} -m "Release ${tag}"`

  console.log(`[release] pushing tag ${tag} to origin...`)
  await $`git push origin ${tag}`

  console.log(`[release] successfully published tag ${tag}! Cloud release workflow triggered.`)
}

main().catch((err: unknown) => {
  console.error('[release] fatal:', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
