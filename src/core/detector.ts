import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { $ } from 'bun'
import type { SupportedStack, Visibility } from '@/types.ts'

export async function detectStack(targetDir: string): Promise<SupportedStack | null> {
  const absDir = resolve(process.cwd(), targetDir)

  if (existsSync(resolve(absDir, 'Cargo.toml'))) {
    return 'rust'
  }

  if (existsSync(resolve(absDir, 'pyproject.toml'))) {
    return 'uv'
  }

  if (existsSync(resolve(absDir, 'package.json'))) {
    return 'bun'
  }

  return null
}

export async function detectVisibility(
  repoSlug: string | null,
  targetDir?: string,
): Promise<Visibility> {
  if (repoSlug) {
    try {
      const res = await $`gh repo view ${repoSlug} --json isPrivate --jq .isPrivate`.text()
      const isPrivate = res.trim() === 'true'
      return isPrivate ? 'private' : 'public'
    } catch {
      // 忽略远端探测失败（如未登录或无网络），继续尝试本地推断
    }
  }

  if (targetDir) {
    const absDir = resolve(process.cwd(), targetDir)
    const licensePath = resolve(absDir, 'LICENSE')
    if (existsSync(licensePath)) {
      const content = await Bun.file(licensePath).text()
      if (content.includes('CONFIDENTIAL') || content.includes('PROPRIETARY')) {
        return 'private'
      }
    }
  }

  return 'public'
}
