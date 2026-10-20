import { existsSync, statSync } from 'node:fs'
import { copyFile, cp, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { buildManifest, ROOT_DIR } from '@/config.ts'
import { detectStack, detectVisibility } from '@/core/detector.ts'
import { mergeGitignore } from '@/core/gitignore.ts'
import type { InitOptions, SupportedStack, Visibility } from '@/types.ts'

export async function initLocalBaseline(
  targetPath: string,
  options: InitOptions = {},
): Promise<{ stack: SupportedStack | null; visibility: Visibility }> {
  const targetDir = resolve(process.cwd(), targetPath)
  if (!existsSync(targetDir) || !statSync(targetDir).isDirectory()) {
    throw new Error(`invalid target directory: ${targetDir}`)
  }

  const log = (msg: string) => {
    if (!options.silent) {
      console.log(msg)
    }
  }

  log(`[init] target: ${targetDir}`)

  const stack = options.stack ?? (await detectStack(targetDir))
  const visibility = options.visibility ?? (await detectVisibility(null, targetDir))

  log(`[init] detected stack: ${stack ?? 'generic'} | visibility: ${visibility}`)

  const manifest = buildManifest(stack ?? undefined, visibility)

  for (const entry of manifest.entries) {
    const srcPath = resolve(ROOT_DIR, entry.src)
    const destPath = resolve(targetDir, entry.dest)

    if (!existsSync(srcPath)) {
      log(`[warn] source missing: ${entry.src}`)
      continue
    }

    const srcStat = statSync(srcPath)
    await mkdir(dirname(destPath), { recursive: true })

    switch (entry.strategy) {
      case 'overwrite': {
        if (srcStat.isDirectory()) {
          await cp(srcPath, destPath, { recursive: true, force: true })
        } else {
          await copyFile(srcPath, destPath)
        }
        log(`[copy] ${entry.dest}`)
        break
      }
      case 'create-only': {
        if (existsSync(destPath)) {
          log(`[skip] ${entry.dest} (exists)`)
        } else {
          if (srcStat.isDirectory()) {
            await cp(srcPath, destPath, { recursive: true, force: true })
          } else {
            await copyFile(srcPath, destPath)
          }
          log(`[copy] ${entry.dest}`)
        }
        break
      }
      case 'merge-lines': {
        const res = await mergeGitignore(srcPath, destPath)
        if (res.created) {
          log(`[copy] ${entry.dest}`)
        } else if (res.appendedCount > 0) {
          log(`[merge] ${entry.dest} (+${res.appendedCount} patterns)`)
        } else {
          log(`[skip] ${entry.dest} (up to date)`)
        }
        break
      }
    }
  }

  log(`[done] local baseline initialized`)
  return { stack, visibility }
}
