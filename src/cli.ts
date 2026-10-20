import {
  resolveRepoSlug,
  syncGitHub,
  syncLabels,
  syncRuleset,
  syncSettings,
} from '@/core/github.ts'
import { initLocalBaseline } from '@/core/init.ts'
import type { SupportedStack, Visibility } from '@/types.ts'

function printHelp(): void {
  console.log(`Usage: standards <command> [target/repo] [options]

Commands:
  init <target>           Initialize local baseline files and configurations
  sync-labels <repo>      Sync standard GitHub labels (e.g. owner/repo)
  sync-ruleset <repo>     Sync default branch protection ruleset
  sync-settings <repo>    Sync repository settings (auto-merge, delete-branch-on-merge)
  sync <repo>             Sync all remote GitHub configurations (settings + labels + ruleset)
  apply [target]          Apply baseline locally and sync to remote if git origin exists

Options:
  --stack <type>          Target language stack: rust, bun, uv (auto-detected if omitted)
  --visibility <scope>    Repository visibility: public, private (auto-detected if omitted)
  -h, --help              Show this help message
`)
}

interface ParsedArgs {
  command?: string
  target?: string
  stack?: SupportedStack
  visibility?: Visibility
  showHelp?: boolean
}

function parseCliArgs(args: string[]): ParsedArgs {
  let command: string | undefined
  let target: string | undefined
  let stack: SupportedStack | undefined
  let visibility: Visibility | undefined
  let showHelp = false

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (!arg) continue

    if (arg === '-h' || arg === '--help' || arg === 'help') {
      showHelp = true
      continue
    }

    if (arg === '--stack' && i + 1 < args.length) {
      const val = args[++i]
      if (val === 'rust' || val === 'bun' || val === 'uv') {
        stack = val
      } else {
        throw new Error(`invalid --stack value: ${val}. supported: rust, bun, uv`)
      }
    } else if (arg.startsWith('--stack=')) {
      const val = arg.split('=')[1]
      if (val === 'rust' || val === 'bun' || val === 'uv') {
        stack = val
      } else {
        throw new Error(`invalid --stack value: ${val}. supported: rust, bun, uv`)
      }
    } else if (arg === '--visibility' && i + 1 < args.length) {
      const val = args[++i]
      if (val === 'public' || val === 'private') {
        visibility = val
      } else {
        throw new Error(`invalid --visibility value: ${val}. supported: public, private`)
      }
    } else if (arg.startsWith('--visibility=')) {
      const val = arg.split('=')[1]
      if (val === 'public' || val === 'private') {
        visibility = val
      } else {
        throw new Error(`invalid --visibility value: ${val}. supported: public, private`)
      }
    } else if (!command) {
      command = arg
    } else if (!target) {
      target = arg
    }
  }

  return { command, target, stack, visibility, showHelp }
}

export async function runCli(rawArgs: string[]): Promise<void> {
  const { command, target, stack, visibility, showHelp } = parseCliArgs(rawArgs)

  if (showHelp || !command) {
    printHelp()
    return
  }

  switch (command) {
    case 'init': {
      if (!target) {
        throw new Error('missing target directory. usage: standards init <target>')
      }
      await initLocalBaseline(target, { stack, visibility })
      break
    }

    case 'sync-labels': {
      if (!target) {
        throw new Error('missing repo. usage: standards sync-labels <owner/repo>')
      }
      await syncLabels(target)
      break
    }

    case 'sync-ruleset': {
      if (!target) {
        throw new Error('missing repo. usage: standards sync-ruleset <owner/repo>')
      }
      await syncRuleset(target)
      break
    }

    case 'sync-settings': {
      if (!target) {
        throw new Error('missing repo. usage: standards sync-settings <owner/repo>')
      }
      await syncSettings(target, visibility)
      break
    }

    case 'sync':
    case 'sync-github': {
      if (!target) {
        throw new Error('missing repo. usage: standards sync <owner/repo>')
      }
      await syncGitHub(target, { visibility })
      break
    }

    case 'apply': {
      const targetDir = target || '.'
      const initResult = await initLocalBaseline(targetDir, { stack, visibility })

      const repoSlug = await resolveRepoSlug(targetDir)
      if (repoSlug) {
        console.log(`[apply] detected remote: ${repoSlug}`)
        await syncGitHub(repoSlug, { visibility: visibility ?? initResult.visibility })
      } else {
        console.log('[apply] no remote github repository detected')
      }
      break
    }

    default: {
      console.error(`unknown command: ${command}`)
      printHelp()
      process.exitCode = 1
    }
  }
}
