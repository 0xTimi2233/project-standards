import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { $ } from 'bun'
import { ROOT_DIR } from '@/config.ts'
import { detectVisibility } from '@/core/detector.ts'
import type { LabelDefinition, RulesetDefinition, SyncOptions, Visibility } from '@/types.ts'

export async function syncSettings(repo: string, visibility?: Visibility): Promise<void> {
  const effectiveVisibility = visibility ?? (await detectVisibility(repo))
  log(`[settings] sync repo: ${repo} (visibility: ${effectiveVisibility})`)

  const discussionsFlag =
    effectiveVisibility === 'public' ? '--enable-discussions' : '--enable-discussions=false'

  try {
    await $`gh repo edit ${repo} --enable-auto-merge --delete-branch-on-merge ${discussionsFlag}`.quiet()
    await $`gh api --method PUT repos/${repo}/actions/permissions/workflow -F default_workflow_permissions=write -F can_approve_pull_request_reviews=true`.quiet()
    log(
      `[settings] auto-merge=true delete-branch-on-merge=true discussions=${effectiveVisibility === 'public'} workflow-pr-creation=true`,
    )
  } catch (error) {
    throw new Error(
      `failed to sync repository settings (${repo}): ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

export async function syncLabels(repo: string): Promise<void> {
  const manifestPath = resolve(ROOT_DIR, 'templates/core/.github/labels.json')
  if (!existsSync(manifestPath)) {
    throw new Error(`labels definition missing: ${manifestPath}`)
  }

  const baselineLabels: LabelDefinition[] = await Bun.file(manifestPath).json()
  const baselineNames = new Set(baselineLabels.map((item) => item.name))

  log(`[labels] sync repo: ${repo}`)

  let remoteLabels: Array<{ name: string }> = []
  try {
    const output = await $`gh label list --repo ${repo} --json name`.text()
    remoteLabels = JSON.parse(output.trim() || '[]')
  } catch (error) {
    throw new Error(
      `failed to fetch labels (${repo}): ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  // 清除不在基线规范中的全部冗余标签（自动化插件如 Renovate 或 release-please 需要时会自动按需创建）
  for (const remote of remoteLabels) {
    if (!baselineNames.has(remote.name)) {
      log(`[labels] prune: ${remote.name}`)
      await $`gh label delete ${remote.name} --repo ${repo} --yes`.quiet()
    }
  }

  // 应用标准标签体系
  for (const label of baselineLabels) {
    log(`[labels] apply: ${label.name}`)
    await $`gh label create ${label.name} --color ${label.color} --description ${label.description} --repo ${repo} --force`.quiet()
  }
}

export async function syncRuleset(repo: string): Promise<void> {
  const rulesetPath = resolve(ROOT_DIR, 'templates/core/.github/ruleset.json')
  if (!existsSync(rulesetPath)) {
    throw new Error(`ruleset definition missing: ${rulesetPath}`)
  }

  log(`[ruleset] sync repo: ${repo}`)

  let responseText = ''
  try {
    const res = await $`gh api repos/${repo}/rulesets`.nothrow()
    responseText = res.stdout.toString() + res.stderr.toString()
    if (res.exitCode !== 0) {
      if (
        responseText.includes('Upgrade to GitHub Pro') ||
        responseText.includes('not supported')
      ) {
        log(`[ruleset] skipped (github free private repo does not support rulesets)`)
        return
      }
      throw new Error(
        `failed to query rulesets (exit code ${res.exitCode}): ${responseText.trim()}`,
      )
    }
  } catch (error) {
    if (
      String(error).includes('Upgrade to GitHub Pro') ||
      String(error).includes('not supported')
    ) {
      log(`[ruleset] skipped (github free private repo does not support rulesets)`)
      return
    }
    throw error
  }

  let rulesets: RulesetDefinition[] = []
  try {
    rulesets = JSON.parse(responseText.trim() || '[]')
  } catch {
    rulesets = []
  }

  const existing = rulesets.find((item) => item.name === 'default-branch-protection')

  if (existing?.id) {
    await $`gh api --method PUT repos/${repo}/rulesets/${existing.id} --input ${rulesetPath}`.quiet()
    log(`[ruleset] updated (id: ${existing.id})`)
  } else {
    await $`gh api --method POST repos/${repo}/rulesets --input ${rulesetPath}`.quiet()
    log(`[ruleset] created`)
  }
}

export async function syncGitHub(repo: string, options: SyncOptions = {}): Promise<void> {
  const visibility = options.visibility ?? (await detectVisibility(repo))
  await syncSettings(repo, visibility)
  await syncLabels(repo)
  await syncRuleset(repo)
  log(`[done] github remote synchronized (${repo})`)
}

export async function resolveRepoSlug(targetPath: string): Promise<string | null> {
  const targetDir = resolve(process.cwd(), targetPath)

  // 原生兼容标准 Git 目录、Submodule 以及 Git Worktree 环境
  try {
    const isInsideWorkTree = (
      await $`git -C ${targetDir} rev-parse --is-inside-work-tree`.text()
    ).trim()
    if (isInsideWorkTree !== 'true') return null
  } catch {
    return null
  }

  try {
    const remoteUrl = (await $`git -C ${targetDir} config --get remote.origin.url`.text()).trim()
    if (!remoteUrl) return null

    const match = remoteUrl.match(/github\.com[:/]([^/]+\/[^/.]+)(?:\.git)?$/)
    return match ? (match[1] ?? null) : null
  } catch {
    return null
  }
}

function log(msg: string) {
  console.log(msg)
}
