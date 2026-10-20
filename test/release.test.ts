import { afterEach, describe, expect, it } from 'bun:test'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  bumpVersion,
  checkChangelogEntry,
  isVersionGreater,
  parseDirtyFiles,
  updateVersionInFiles,
} from '../scripts/release.ts'

describe('release script core logic', () => {
  let tempDir: string | null = null

  afterEach(async () => {
    if (tempDir && existsSync(tempDir)) {
      await rm(tempDir, { recursive: true, force: true })
    }
  })

  describe('parseDirtyFiles', () => {
    it('should ignore CHANGELOG.md when it is the only modified file', () => {
      expect(parseDirtyFiles(' M CHANGELOG.md\n')).toEqual([])
      expect(parseDirtyFiles('M  CHANGELOG.md\n')).toEqual([])
      expect(parseDirtyFiles('MM CHANGELOG.md\n')).toEqual([])
    })

    it('should detect other dirty files correctly', () => {
      const output = ' M CHANGELOG.md\n M package.json\n?? src/new.ts\n'
      expect(parseDirtyFiles(output)).toEqual(['package.json', 'src/new.ts'])
    })

    it('should return empty array for clean status', () => {
      expect(parseDirtyFiles('')).toEqual([])
      expect(parseDirtyFiles('   \n')).toEqual([])
    })
  })

  describe('bumpVersion', () => {
    it('should bump patch version by default', () => {
      expect(bumpVersion('0.1.0', 'patch')).toBe('0.1.1')
      expect(bumpVersion('v0.1.0', 'patch')).toBe('0.1.1')
    })

    it('should bump minor version correctly', () => {
      expect(bumpVersion('0.1.5', 'minor')).toBe('0.2.0')
    })

    it('should bump major version correctly', () => {
      expect(bumpVersion('0.1.5', 'major')).toBe('1.0.0')
    })

    it('should accept explicit semantic version', () => {
      expect(bumpVersion('0.1.0', '0.3.5')).toBe('0.3.5')
    })

    it('should throw on invalid bump arguments', () => {
      expect(() => bumpVersion('0.1.0', 'invalid')).toThrow()
    })
  })

  describe('isVersionGreater', () => {
    it('should compare versions correctly', () => {
      expect(isVersionGreater('0.1.1', '0.1.0')).toBe(true)
      expect(isVersionGreater('0.2.0', '0.1.9')).toBe(true)
      expect(isVersionGreater('1.0.0', '0.9.9')).toBe(true)
      expect(isVersionGreater('0.1.0', '0.1.0')).toBe(false)
      expect(isVersionGreater('0.1.0', '0.1.1')).toBe(false)
    })
  })

  describe('checkChangelogEntry', () => {
    it('should pass when version entry exists', async () => {
      tempDir = await mkdtemp(join(tmpdir(), 'rel-test-'))
      await writeFile(
        join(tempDir, 'CHANGELOG.md'),
        '# Changelog\n\n## [0.1.1] - 2026-10-20\n- fix\n',
      )
      await expect(checkChangelogEntry('0.1.1', tempDir)).resolves.toBeUndefined()
    })

    it('should throw when version entry is missing', async () => {
      tempDir = await mkdtemp(join(tmpdir(), 'rel-test-'))
      await writeFile(
        join(tempDir, 'CHANGELOG.md'),
        '# Changelog\n\n## [0.1.0] - 2026-10-20\n- feat\n',
      )
      await expect(checkChangelogEntry('0.1.1', tempDir)).rejects.toThrow()
    })
  })

  describe('updateVersionInFiles', () => {
    it('should synchronize versions across multiple manifest files', async () => {
      tempDir = await mkdtemp(join(tmpdir(), 'rel-test-'))
      await writeFile(join(tempDir, 'package.json'), JSON.stringify({ version: '0.1.0' }, null, 2))
      await writeFile(join(tempDir, 'manifest.json'), JSON.stringify({ version: '0.1.0' }, null, 2))
      await writeFile(
        join(tempDir, 'dist-workspace.toml'),
        '[package]\nname = "test"\nversion = "0.1.0"\n',
      )

      const updated = await updateVersionInFiles('0.1.1', tempDir)
      expect(updated).toEqual(['package.json', 'manifest.json', 'dist-workspace.toml'])

      const pkg = JSON.parse(await readFile(join(tempDir, 'package.json'), 'utf-8'))
      expect(pkg.version).toBe('0.1.1')

      const dist = await readFile(join(tempDir, 'dist-workspace.toml'), 'utf-8')
      expect(dist).toContain('version = "0.1.1"')
    })
  })
})
