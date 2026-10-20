#!/usr/bin/env bun
import { existsSync } from 'node:fs'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { $ } from 'bun'
import { parse } from 'smol-toml'

async function getRemoteLatestTag(): Promise<string | null> {
  await $`git fetch --tags origin`.quiet()
  const raw = await $`git tag -l --sort=-v:refname`.text()
  const tags = raw
    .split('\n')
    .map((t) => t.trim())
    .filter(Boolean)
  return tags[0] ?? null
}

async function getLocalBaseVersion(rootDir: string): Promise<string> {
  const pkgPath = resolve(rootDir, 'package.json')
  if (existsSync(pkgPath)) {
    const pkg = (await Bun.file(pkgPath).json()) as { version?: string }
    if (pkg.version) return pkg.version.trim()
  }

  const distPath = resolve(rootDir, 'dist-workspace.toml')
  if (existsSync(distPath)) {
    const toml = parse(await readFile(distPath, 'utf-8')) as {
      package?: { version?: string }
    }
    if (toml.package?.version) return toml.package.version.trim()
  }

  const cargoPath = resolve(rootDir, 'Cargo.toml')
  if (existsSync(cargoPath)) {
    const toml = parse(await readFile(cargoPath, 'utf-8')) as {
      package?: { version?: string }
    }
    if (toml.package?.version) return toml.package.version.trim()
  }

  const pyprojectPath = resolve(rootDir, 'pyproject.toml')
  if (existsSync(pyprojectPath)) {
    const toml = parse(await readFile(pyprojectPath, 'utf-8')) as {
      project?: { version?: string }
    }
    if (toml.project?.version) return toml.project.version.trim()
  }

  return '0.1.0'
}

function bumpVersion(baseVer: string, bumpType: string): string {
  const parts = baseVer.replace(/^v/, '').split('.').map(Number)
  let [major = 0, minor = 1, patch = 0] = parts

  if (bumpType === 'major') {
    major += 1
    minor = 0
    patch = 0
  } else if (bumpType === 'minor') {
    minor += 1
    patch = 0
  } else if (bumpType === 'patch') {
    patch += 1
  } else if (/^\d+\.\d+\.\d+$/.test(bumpType)) {
    return bumpType
  } else {
    throw new Error(
      `[release] error: invalid bump argument '${bumpType}'. use patch, minor, major or X.Y.Z`,
    )
  }

  return `${major}.${minor}.${patch}`
}

async function updateVersionInFiles(newVersion: string, rootDir: string): Promise<string[]> {
  const modified: string[] = []

  const pkgPath = resolve(rootDir, 'package.json')
  if (existsSync(pkgPath)) {
    const pkg = (await Bun.file(pkgPath).json()) as { version?: string }
    pkg.version = newVersion
    await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8')
    modified.push('package.json')
  }

  const manifestPath = resolve(rootDir, 'manifest.json')
  if (existsSync(manifestPath)) {
    const manifest = (await Bun.file(manifestPath).json()) as { version?: string }
    manifest.version = newVersion
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8')
    modified.push('manifest.json')
  }

  const distPath = resolve(rootDir, 'dist-workspace.toml')
  if (existsSync(distPath)) {
    let content = await readFile(distPath, 'utf-8')
    content = content.replace(/(version\s*=\s*")[^"]+(")/, `$1${newVersion}$2`)
    await writeFile(distPath, content, 'utf-8')
    modified.push('dist-workspace.toml')
  }

  const cargoPath = resolve(rootDir, 'Cargo.toml')
  if (existsSync(cargoPath)) {
    let content = await readFile(cargoPath, 'utf-8')
    content = content.replace(/(\[package\][\s\S]*?version\s*=\s*")[^"]+(")/, `$1${newVersion}$2`)
    await writeFile(cargoPath, content, 'utf-8')
    modified.push('Cargo.toml')
  }

  const pyprojectPath = resolve(rootDir, 'pyproject.toml')
  if (existsSync(pyprojectPath)) {
    let content = await readFile(pyprojectPath, 'utf-8')
    content = content.replace(/(version\s*=\s*")[^"]+(")/, `$1${newVersion}$2`)
    await writeFile(pyprojectPath, content, 'utf-8')
    modified.push('pyproject.toml')
  }

  return modified
}

async function archiveChangelog(newVersion: string, rootDir: string): Promise<boolean> {
  const changelogPath = resolve(rootDir, 'CHANGELOG.md')
  if (!existsSync(changelogPath)) return false

  let content = await readFile(changelogPath, 'utf-8')
  if (content.includes(`## [${newVersion}]`)) return false

  const today = new Date().toISOString().slice(0, 10)
  const header = `## [${newVersion}] - ${today}\n\n### 优化\n- 自动化工程基线与流水线适配。`

  if (content.includes('## [Unreleased]')) {
    content = content.replace('## [Unreleased]', `## [Unreleased]\n\n${header}`)
  } else {
    content = content.replace(/(# 变更日志[\s\S]*?\n\n)(## \[)/, `$1${header}\n\n$2`)
  }

  await writeFile(changelogPath, content, 'utf-8')
  return true
}

async function main() {
  const rootDir = process.cwd()
  const bumpArg = process.argv[2] ?? 'patch'

  const status = (await $`git status --porcelain`.text()).trim()
  if (status.length > 0) {
    console.error('[release] error: working tree has uncommitted changes. aborting.')
    process.exit(1)
  }

  const currentBranch = (await $`git branch --show-current`.text()).trim()
  if (currentBranch !== 'main' && currentBranch !== 'master') {
    console.error(
      `[release] error: must be on main branch to initiate release (current: ${currentBranch}).`,
    )
    process.exit(1)
  }

  const remoteTag = await getRemoteLatestTag()
  const localVer = await getLocalBaseVersion(rootDir)
  const baseVer = remoteTag ? remoteTag.replace(/^v/, '') : localVer
  const targetVersion = bumpVersion(baseVer, bumpArg)
  const targetTag = `v${targetVersion}`

  console.log(`[release] bumping version from ${baseVer} to ${targetVersion} (${targetTag})...`)

  // 1. 自动原子更新文件中的版本
  const updatedFiles = await updateVersionInFiles(targetVersion, rootDir)
  console.log(`[release] updated version in: ${updatedFiles.join(', ')}`)

  // 2. 自动归档 CHANGELOG.md
  if (await archiveChangelog(targetVersion, rootDir)) {
    updatedFiles.push('CHANGELOG.md')
    console.log('[release] archived CHANGELOG.md entry')
  }

  // 3. 运行代码格式化
  if (existsSync(resolve(rootDir, 'biome.json'))) {
    await $`bun run format`.quiet()
  }

  // 4. 创建 Release PR
  const releaseBranch = `chore/release-v${targetVersion}`
  console.log(`[release] creating branch: ${releaseBranch}...`)
  await $`git checkout -b ${releaseBranch}`
  await $`git add -A`
  await $`git commit -m "chore(release): bump version to ${targetVersion}"`
  await $`git push -u origin ${releaseBranch}`

  console.log(`[release] opening release PR...`)
  const prTitle = `chore(release): bump version to ${targetVersion}`
  const prBody = `Automated release PR bumping version to ${targetVersion}.`
  const prOut = await $`gh pr create --title ${prTitle} --body ${prBody}`.text()
  const prUrl = prOut.trim()
  console.log(`[release] PR created: ${prUrl}`)

  // 5. 开启自动合并
  console.log('[release] enabling auto-merge for release PR...')
  await $`gh pr merge ${prUrl} --auto --squash --delete-branch`.quiet()

  // 6. 等待门禁跑通
  console.log('[release] waiting for CI checks to pass and merge...')
  for (let i = 0; i < 40; i++) {
    const prState = await $`gh pr view ${prUrl} --json state,mergedAt`.text()
    const stateObj = JSON.parse(prState) as { state: string; mergedAt: string | null }
    if (stateObj.mergedAt) {
      console.log('[release] PR successfully merged!')
      break
    }
    await $`sleep 5`
  }

  // 7. 切回主干并同步
  await $`git checkout ${currentBranch}`
  await $`git pull origin ${currentBranch}`
  await $`git branch -D ${releaseBranch} 2>/dev/null || true`.quiet()

  // 8. 打 Tag 并推送到远端
  console.log(`[release] creating and pushing tag ${targetTag}...`)
  await $`git tag -a ${targetTag} -m "Release ${targetTag}"`
  await $`git push origin ${targetTag}`

  console.log(`[release] successfully published ${targetTag}! Cloud release workflow dispatched.`)
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
