import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as core from '@actions/core'
import { vi } from 'vitest'

import { getConfig } from './get-config.js'

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}))

vi.mock('@actions/core', () => ({
  warning: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
}))

const mockedExistsSync = vi.mocked(existsSync)
const mockedReadFileSync = vi.mocked(readFileSync)
const mockedWarning = vi.mocked(core.warning)

describe('getConfig', () => {
  const originalCwd = process.cwd

  beforeEach(() => {
    vi.clearAllMocks()
    process.cwd = () => '/test'
  })

  afterEach(() => {
    process.cwd = originalCwd
  })

  test('returns empty config when no auto-discovered file exists', () => {
    mockedExistsSync.mockReturnValue(false)

    const result = getConfig()

    expect(result.config).toEqual({})
    expect(result.missingExplicitPath).toBeNull()
  })

  test('loads config from explicit JSON path', () => {
    const configContent = JSON.stringify({
      path: './custom/CHANGELOG.md',
      validation_level: 'warn',
      validation_depth: 5,
    })

    mockedExistsSync.mockReturnValue(true)
    mockedReadFileSync.mockReturnValue(configContent)

    const result = getConfig('.changelog-reader.json')

    expect(result.config).toEqual({
      path: './custom/CHANGELOG.md',
      validation_level: 'warn',
      validation_depth: 5,
    })
    expect(result.missingExplicitPath).toBeNull()
  })

  test('loads config from explicit YAML path', () => {
    const configContent = `
# Configuration for changelog-reader-action
path: ./custom/CHANGELOG.md
validation_level: error
validation_depth: 20
`

    mockedExistsSync.mockReturnValue(true)
    mockedReadFileSync.mockReturnValue(configContent)

    const result = getConfig('.changelog-reader.yml')

    expect(result.config).toEqual({
      path: './custom/CHANGELOG.md',
      validation_level: 'error',
      validation_depth: 20,
    })
  })

  test('auto-discovers .changelog-reader.json', () => {
    const configContent = JSON.stringify({ validation_level: 'warn' })

    mockedExistsSync.mockImplementation(
      (filePath) => filePath === resolve('/test', '.changelog-reader.json')
    )
    mockedReadFileSync.mockReturnValue(configContent)

    const result = getConfig()

    expect(result.config).toEqual({ validation_level: 'warn' })
  })

  test('auto-discovers .changelog-reader.yml', () => {
    mockedExistsSync.mockImplementation(
      (filePath) => filePath === resolve('/test', '.changelog-reader.yml')
    )
    mockedReadFileSync.mockReturnValue(`validation_level: error`)

    const result = getConfig()

    expect(result.config).toEqual({ validation_level: 'error' })
  })

  test('auto-discovers .changelogrc', () => {
    mockedExistsSync.mockImplementation((filePath) => filePath === resolve('/test', '.changelogrc'))
    mockedReadFileSync.mockReturnValue(JSON.stringify({ path: './docs/CHANGELOG.md' }))

    const result = getConfig()

    expect(result.config).toEqual({ path: './docs/CHANGELOG.md' })
  })

  test('flags an explicit path that does not exist', () => {
    mockedExistsSync.mockReturnValue(false)

    const result = getConfig('./non-existent-config.json')

    expect(result.config).toEqual({})
    expect(result.missingExplicitPath).toEqual('./non-existent-config.json')
  })

  test('parses YAML with quoted values', () => {
    const configContent = `
path: "./custom/CHANGELOG.md"
validation_level: 'warn'
`

    mockedExistsSync.mockReturnValue(true)
    mockedReadFileSync.mockReturnValue(configContent)

    const result = getConfig('.changelog-reader.yaml')

    expect(result.config).toEqual({
      path: './custom/CHANGELOG.md',
      validation_level: 'warn',
    })
  })

  test('handles YAML comments correctly', () => {
    const configContent = `
# This is a comment
path: ./CHANGELOG.md
# Another comment
validation_level: warn # inline comment
`

    mockedExistsSync.mockReturnValue(true)
    mockedReadFileSync.mockReturnValue(configContent)

    const result = getConfig('.changelog-reader.yml')

    expect(result.config.path).toEqual('./CHANGELOG.md')
    expect(result.config.validation_level).toEqual('warn')
  })

  test('returns empty config for empty YAML file', () => {
    mockedExistsSync.mockReturnValue(true)
    mockedReadFileSync.mockReturnValue('')

    const result = getConfig('.changelog-reader.yml')

    expect(result.config).toEqual({})
  })

  test('throws when the config root is an array', () => {
    mockedExistsSync.mockReturnValue(true)
    mockedReadFileSync.mockReturnValue('[1, 2, 3]')

    expect(() => getConfig('.changelog-reader.json')).toThrow(/must contain an object at the root/)
  })

  test('throws when the config root is a scalar', () => {
    mockedExistsSync.mockReturnValue(true)
    mockedReadFileSync.mockReturnValue('"just a string"')

    expect(() => getConfig('.changelog-reader.json')).toThrow(/must contain an object at the root/)
  })

  test('warns and ignores fields with the wrong type', () => {
    const configContent = JSON.stringify({
      path: 42,
      version: ['1.0.0'],
      validation_level: 'verbose',
      validation_depth: 'abc',
    })

    mockedExistsSync.mockReturnValue(true)
    mockedReadFileSync.mockReturnValue(configContent)

    const result = getConfig('.changelog-reader.json')

    expect(result.config).toEqual({})
    expect(mockedWarning).toHaveBeenCalledWith(expect.stringContaining("'path' must be a string"))
    expect(mockedWarning).toHaveBeenCalledWith(
      expect.stringContaining("'version' must be a string")
    )
    expect(mockedWarning).toHaveBeenCalledWith(
      expect.stringContaining("'validation_level' must be one of")
    )
    expect(mockedWarning).toHaveBeenCalledWith(
      expect.stringContaining("'validation_depth' must be a non-negative integer")
    )
  })

  test('warns when validation_depth is a non-integer or negative', () => {
    mockedExistsSync.mockReturnValue(true)
    mockedReadFileSync.mockReturnValue(JSON.stringify({ validation_depth: -5 }))

    const result = getConfig('.changelog-reader.json')

    expect(result.config).toEqual({})
    expect(mockedWarning).toHaveBeenCalledWith(
      expect.stringContaining("'validation_depth' must be a non-negative integer")
    )
  })

  test('drops unknown fields silently', () => {
    const configContent = JSON.stringify({
      path: './CHANGELOG.md',
      unknown_option: 42,
    })

    mockedExistsSync.mockReturnValue(true)
    mockedReadFileSync.mockReturnValue(configContent)

    const result = getConfig('.changelog-reader.json')

    expect(result.config).toEqual({ path: './CHANGELOG.md' })
    expect(mockedWarning).not.toHaveBeenCalled()
  })
})
