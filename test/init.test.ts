import { afterEach, describe, expect, it } from 'bun:test'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { runCli } from '@/cli.ts'
import { initLocalBaseline } from '@/core/init.ts'

describe('initLocalBaseline', () => {
  let tempDir: string | null = null

  afterEach(async () => {
    if (tempDir && existsSync(tempDir)) {
      await rm(tempDir, { recursive: true, force: true })
    }
  })

  it('should initialize core baseline files', async () => {
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
    expect(existsSync(join(tempDir, '.markdownlint-cli2.jsonc'))).toBe(true)
    expect(existsSync(join(tempDir, '.gitignore'))).toBe(true)
    expect(existsSync(join(tempDir, 'LICENSE'))).toBe(true)
  })

  it('should auto-detect and initialize Rust stack with release-plz', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'standards-rust-'))
    await writeFile(
      join(tempDir, 'Cargo.toml'),
      '[package]\nname = "demo"\nversion = "0.1.0"\n',
      'utf-8',
    )

    const res = await initLocalBaseline(tempDir, { silent: true })
    expect(res.stack).toBe('rust')

    expect(existsSync(join(tempDir, 'rust-toolchain.toml'))).toBe(true)
    expect(existsSync(join(tempDir, 'deny.toml'))).toBe(true)
    expect(existsSync(join(tempDir, '.github/workflows/ci.yml'))).toBe(true)
    expect(existsSync(join(tempDir, '.github/workflows/release.yml'))).toBe(true)

    const releaseContent = await readFile(join(tempDir, '.github/workflows/release.yml'), 'utf-8')
    expect(releaseContent).toContain('release-plz')
    expect(releaseContent).toContain('upload-rust-binary-action')

    const ciContent = await readFile(join(tempDir, '.github/workflows/ci.yml'), 'utf-8')
    expect(ciContent).toContain('security.yml')
    expect(ciContent).toContain('cargo test --all-features --locked')
  })

  it('should auto-detect and initialize Bun stack', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'standards-bun-'))
    await writeFile(join(tempDir, 'package.json'), '{"name": "demo", "version": "0.1.0"}', 'utf-8')

    const res = await initLocalBaseline(tempDir, { silent: true })
    expect(res.stack).toBe('bun')

    expect(existsSync(join(tempDir, 'biome.json'))).toBe(true)
    expect(existsSync(join(tempDir, '.github/workflows/ci.yml'))).toBe(true)
    expect(existsSync(join(tempDir, '.github/workflows/release.yml'))).toBe(true)

    const releaseContent = await readFile(join(tempDir, '.github/workflows/release.yml'), 'utf-8')
    expect(releaseContent).toContain('release-type: node')
  })

  it('should auto-detect and initialize uv Python stack', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'standards-uv-'))
    await writeFile(
      join(tempDir, 'pyproject.toml'),
      '[project]\nname = "demo"\nversion = "0.1.0"\n',
      'utf-8',
    )

    const res = await initLocalBaseline(tempDir, { silent: true })
    expect(res.stack).toBe('uv')

    expect(existsSync(join(tempDir, 'ruff.toml'))).toBe(true)
    expect(existsSync(join(tempDir, '.github/workflows/ci.yml'))).toBe(true)
    expect(existsSync(join(tempDir, '.github/workflows/release.yml'))).toBe(true)

    const releaseContent = await readFile(join(tempDir, '.github/workflows/release.yml'), 'utf-8')
    expect(releaseContent).toContain('release-type: python')
    expect(releaseContent).toContain('astral-sh/setup-uv')
  })

  it('should apply proprietary license for private visibility', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'standards-priv-'))

    await initLocalBaseline(tempDir, { visibility: 'private', silent: true })

    const licenseContent = await readFile(join(tempDir, 'LICENSE'), 'utf-8')
    expect(licenseContent).toContain('CONFIDENTIAL AND PROPRIETARY')
  })

  it('should apply MIT license for public visibility', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'standards-pub-'))

    await initLocalBaseline(tempDir, { visibility: 'public', silent: true })

    const licenseContent = await readFile(join(tempDir, 'LICENSE'), 'utf-8')
    expect(licenseContent).toContain('MIT License')
  })

  it('should respect create-only strategy for existing files', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'standards-test-'))
    const customRenovate = '{"custom": true}'
    await writeFile(join(tempDir, 'renovate.json'), customRenovate, 'utf-8')

    await initLocalBaseline(tempDir, { silent: true })

    const content = await readFile(join(tempDir, 'renovate.json'), 'utf-8')
    expect(content).toBe(customRenovate)
  })

  it('should idempotently merge .gitignore across stacks', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'standards-test-'))
    const initialIgnore = 'my-custom-build/\n'
    await writeFile(join(tempDir, '.gitignore'), initialIgnore, 'utf-8')

    // First execution
    await initLocalBaseline(tempDir, { stack: 'rust', silent: true })
    const mergedContent1 = await readFile(join(tempDir, '.gitignore'), 'utf-8')

    // Second execution (Idempotent test)
    await initLocalBaseline(tempDir, { stack: 'rust', silent: true })
    const mergedContent2 = await readFile(join(tempDir, '.gitignore'), 'utf-8')

    expect(mergedContent1).toBe(mergedContent2)
    expect(mergedContent1).toContain('my-custom-build/')
    expect(mergedContent1).toContain('.DS_Store')
    expect(mergedContent1).toContain('target/')
  })

  it('should handle -h and --help gracefully in cli', async () => {
    // Should not throw when help is requested with subcommands
    await runCli(['init', '-h'])
    await runCli(['--help'])
  })
})
