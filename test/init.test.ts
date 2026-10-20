import { afterEach, describe, expect, it } from 'bun:test'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { initLocalBaseline } from '@/core/init.ts'

describe('initLocalBaseline', () => {
  let tempDir: string | null = null

  afterEach(async () => {
    if (tempDir && existsSync(tempDir)) {
      await rm(tempDir, { recursive: true, force: true })
    }
  })

  it('should initialize baseline files correctly', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'standards-test-'))

    await initLocalBaseline(tempDir, { silent: true })

    expect(existsSync(join(tempDir, '.gitmessage'))).toBe(true)
    expect(existsSync(join(tempDir, '.github/labels.json'))).toBe(true)
    expect(existsSync(join(tempDir, '.github/ruleset.json'))).toBe(true)
    expect(existsSync(join(tempDir, '.github/ISSUE_TEMPLATE/feature_request.yml'))).toBe(true)
    expect(existsSync(join(tempDir, '.github/PULL_REQUEST_TEMPLATE.md'))).toBe(true)
    expect(existsSync(join(tempDir, 'renovate.json'))).toBe(true)
    expect(existsSync(join(tempDir, 'CONTRIBUTING.md'))).toBe(true)
    expect(existsSync(join(tempDir, 'SECURITY.md'))).toBe(true)
    expect(existsSync(join(tempDir, '.gitignore'))).toBe(true)
  })

  it('should respect create-only strategy for existing files', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'standards-test-'))
    const customRenovate = '{"custom": true}'
    await writeFile(join(tempDir, 'renovate.json'), customRenovate, 'utf-8')

    await initLocalBaseline(tempDir, { silent: true })

    const content = await readFile(join(tempDir, 'renovate.json'), 'utf-8')
    expect(content).toBe(customRenovate)
  })

  it('should idempotently merge .gitignore', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'standards-test-'))
    const initialIgnore = 'my-custom-build/\nnode_modules/\n'
    await writeFile(join(tempDir, '.gitignore'), initialIgnore, 'utf-8')

    await initLocalBaseline(tempDir, { silent: true })

    const mergedContent = await readFile(join(tempDir, '.gitignore'), 'utf-8')
    expect(mergedContent).toContain('my-custom-build/')
    expect(mergedContent).toContain('# --- Standard Baseline Ignore Rules ---')
    expect(mergedContent).toContain('.DS_Store')
  })
})
