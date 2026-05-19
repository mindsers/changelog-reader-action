import { existsSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import * as core from '@actions/core'
import { vi } from 'vitest'

import { main } from './main.js'

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}))

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
}))

vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
  setOutput: vi.fn(),
  setFailed: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  warning: vi.fn(),
  error: vi.fn(),
  startGroup: vi.fn(),
  endGroup: vi.fn(),
}))

const mockedReadFile = vi.mocked(readFile)
const mockedExistsSync = vi.mocked(existsSync)
const mockedReadFileSync = vi.mocked(readFileSync)
const mockedCore = vi.mocked(core)

const HAPPY_CHANGELOG = `# Changelog

## [Unreleased]

### Added

- Future feature

## [2.0.0] - 2024-01-15

### Changed

- Big change

## [1.0.0] - 2023-06-01

### Added

- First version

[unreleased]: https://github.com/foo/bar/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/foo/bar/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/foo/bar/releases/tag/v1.0.0
`

const YANKED_CHANGELOG = `# Changelog

## [2.0.0] - 2024-01-15 [YANKED]

### Fixed

- Critical regression discovered post-release
`

const PRERELEASED_CHANGELOG = `# Changelog

## [2.0.0-alpha.1] - 2024-01-15

### Added

- Experimental feature
`

// Chronologically inverted: newer release listed below older one.
const INVALID_CHANGELOG = `# Changelog

## [1.0.0] - 2024-01-15

### Added

- This should be at the bottom

## [2.0.0] - 2023-06-01

### Added

- This should be at the top
`

function setInputs(values: Record<string, string>) {
  mockedCore.getInput.mockImplementation((name: string) => values[name] || '')
}

function setChangelogContents(contents: string) {
  mockedReadFile.mockResolvedValue(Buffer.from(contents))
}

function getOutput(name: string): unknown {
  const call = mockedCore.setOutput.mock.calls.find(([key]) => key === name)
  return call ? call[1] : undefined
}

describe('main', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedExistsSync.mockReturnValue(false)
  })

  test('returns the most recent released entry when no version input is given', async () => {
    setInputs({})
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(mockedCore.setFailed).not.toHaveBeenCalled()
    expect(getOutput('version')).toEqual('2.0.0')
    expect(getOutput('date')).toEqual('2024-01-15')
    expect(getOutput('status')).toEqual('released')
    expect(getOutput('changes')).toContain('Big change')
  })

  test('returns the requested version when version input matches an entry', async () => {
    setInputs({ version: '1.0.0' })
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(mockedCore.setFailed).not.toHaveBeenCalled()
    expect(getOutput('version')).toEqual('1.0.0')
    expect(getOutput('date')).toEqual('2023-06-01')
    expect(getOutput('status')).toEqual('released')
    expect(getOutput('changes')).toContain('First version')
  })

  test('fails when the requested version is not present', async () => {
    setInputs({ version: '9.9.9' })
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(mockedCore.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('No log entry found for version 9.9.9')
    )
  })

  test('returns the Unreleased entry when version=Unreleased', async () => {
    setInputs({ version: 'Unreleased' })
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(mockedCore.setFailed).not.toHaveBeenCalled()
    expect(getOutput('version')).toEqual('Unreleased')
    expect(getOutput('status')).toEqual('unreleased')
    expect(getOutput('changes')).toContain('Future feature')
  })

  test('reports yanked status for a yanked entry', async () => {
    setInputs({})
    setChangelogContents(YANKED_CHANGELOG)

    await main()

    expect(mockedCore.setFailed).not.toHaveBeenCalled()
    expect(getOutput('version')).toEqual('2.0.0')
    expect(getOutput('status')).toEqual('yanked')
  })

  test('reports prereleased status for a prerelease entry', async () => {
    setInputs({})
    setChangelogContents(PRERELEASED_CHANGELOG)

    await main()

    expect(mockedCore.setFailed).not.toHaveBeenCalled()
    expect(getOutput('version')).toEqual('2.0.0-alpha.1')
    expect(getOutput('status')).toEqual('prereleased')
  })

  test("skips validation when validation_level is 'none'", async () => {
    setInputs({ validation_level: 'none' })
    setChangelogContents(INVALID_CHANGELOG)

    await main()

    expect(mockedCore.setFailed).not.toHaveBeenCalled()
    expect(mockedCore.warning).not.toHaveBeenCalledWith(
      expect.stringContaining('Changelog versions out of order')
    )
    expect(mockedCore.error).not.toHaveBeenCalledWith(
      expect.stringContaining('Changelog versions out of order')
    )
  })

  test("logs warnings without failing when validation_level is 'warn'", async () => {
    setInputs({ validation_level: 'warn' })
    setChangelogContents(INVALID_CHANGELOG)

    await main()

    expect(mockedCore.setFailed).not.toHaveBeenCalled()
    expect(mockedCore.warning).toHaveBeenCalled()
    expect(getOutput('version')).toEqual('1.0.0')
  })

  test("fails the build when validation_level is 'error' and the changelog is invalid", async () => {
    setInputs({ validation_level: 'error' })
    setChangelogContents(INVALID_CHANGELOG)

    await main()

    expect(mockedCore.setFailed).toHaveBeenCalled()
  })

  test("does not fail when validation_level is 'error' and the changelog is valid", async () => {
    setInputs({ validation_level: 'error' })
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(mockedCore.setFailed).not.toHaveBeenCalled()
    expect(getOutput('version')).toEqual('2.0.0')
  })

  test('applies values from a config file when no overriding action input is set', async () => {
    setInputs({ config_file: '.changelog-reader.json' })
    mockedExistsSync.mockReturnValue(true)
    mockedReadFileSync.mockReturnValue(
      JSON.stringify({ version: '1.0.0', validation_level: 'none' })
    )
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(mockedCore.setFailed).not.toHaveBeenCalled()
    expect(getOutput('version')).toEqual('1.0.0')
    expect(getOutput('date')).toEqual('2023-06-01')
  })

  test('action input takes precedence over config file value', async () => {
    setInputs({ config_file: '.changelog-reader.json', version: '2.0.0' })
    mockedExistsSync.mockReturnValue(true)
    mockedReadFileSync.mockReturnValue(JSON.stringify({ version: '1.0.0' }))
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(getOutput('version')).toEqual('2.0.0')
  })

  test('uses the default changelog path when none is configured', async () => {
    setInputs({})
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(mockedReadFile).toHaveBeenCalledWith('./CHANGELOG.md')
  })

  test('uses the configured changelog path when set via action input', async () => {
    setInputs({ path: './docs/CHANGELOG.md' })
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(mockedReadFile).toHaveBeenCalledWith('./docs/CHANGELOG.md')
  })

  test('warns and falls back when validation_level is an unknown value', async () => {
    setInputs({ validation_level: 'verbose' })
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(mockedCore.setFailed).not.toHaveBeenCalled()
    expect(mockedCore.warning).toHaveBeenCalledWith(
      expect.stringContaining("Invalid validation_level 'verbose'")
    )
    // Falls back to 'none' so no validation runs against this valid changelog.
    expect(getOutput('version')).toEqual('2.0.0')
  })

  test('warns and falls back when validation_depth is not a number', async () => {
    setInputs({ validation_level: 'warn', validation_depth: 'abc' })
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(mockedCore.setFailed).not.toHaveBeenCalled()
    expect(mockedCore.warning).toHaveBeenCalledWith(
      expect.stringContaining("Invalid validation_depth 'abc'")
    )
  })

  test('warns and falls back when validation_depth is negative', async () => {
    setInputs({ validation_level: 'warn', validation_depth: '-5' })
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(mockedCore.warning).toHaveBeenCalledWith(
      expect.stringContaining("Invalid validation_depth '-5'")
    )
  })

  test('warns when an explicit config_file path does not exist', async () => {
    setInputs({ config_file: './missing-config.json' })
    mockedExistsSync.mockReturnValue(false)
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(mockedCore.setFailed).not.toHaveBeenCalled()
    expect(mockedCore.warning).toHaveBeenCalledWith(
      expect.stringContaining("Config file './missing-config.json' not found")
    )
    // Action still produces output from inputs / defaults.
    expect(getOutput('version')).toEqual('2.0.0')
  })
})
