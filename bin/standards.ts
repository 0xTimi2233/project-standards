#!/usr/bin/env bun
import { runCli } from '@/cli.ts'

runCli(process.argv.slice(2)).catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
