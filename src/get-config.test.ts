import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { vi } from 'vitest'

import { getConfig } from './get-config.js'

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}))

const mockedExistsSync = vi.mocked(existsSync)
const mockedReadFileSync = vi.mocked(readFileSync)

describe('getConfig', () => {
  const originalCwd = process.cwd

  beforeEach(() => {
    vi.clearAllMocks()
    process.cwd = () => '/test'
  })

  afterEach(() => {
    process.cwd = originalCwd
  })

  test('returns empty object when no config file exists', () => {
    mockedExistsSync.mockReturnValue(false)
    const config = getConfig()
    expect(config).toEqual({})
  })

  test('loads config from explicit JSON path', () => {
    const configContent = JSON.stringify({
      path: './custom/CHANGELOG.md',
      validation_level: 'warn',
      validation_depth: 5,
    })

    mockedExistsSync.mockReturnValue(true)
    mockedReadFileSync.mockReturnValue(configContent)

    const config = getConfig('.changelog-reader.json')

    expect(config).toEqual({
      path: './custom/CHANGELOG.md',
      validation_level: 'warn',
      validation_depth: 5,
    })
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

    const config = getConfig('.changelog-reader.yml')

    expect(config).toEqual({
      path: './custom/CHANGELOG.md',
      validation_level: 'error',
      validation_depth: 20,
    })
  })

  test('auto-discovers .changelog-reader.json', () => {
    const configContent = JSON.stringify({
      validation_level: 'warn',
    })

    mockedExistsSync.mockImplementation(
      (filePath) => filePath === resolve('/test', '.changelog-reader.json')
    )
    mockedReadFileSync.mockReturnValue(configContent)

    const config = getConfig()

    expect(config).toEqual({
      validation_level: 'warn',
    })
  })

  test('auto-discovers .changelog-reader.yml', () => {
    const configContent = `validation_level: error`

    mockedExistsSync.mockImplementation(
      (filePath) => filePath === resolve('/test', '.changelog-reader.yml')
    )
    mockedReadFileSync.mockReturnValue(configContent)

    const config = getConfig()

    expect(config).toEqual({
      validation_level: 'error',
    })
  })

  test('auto-discovers .changelogrc', () => {
    const configContent = JSON.stringify({
      path: './docs/CHANGELOG.md',
    })

    mockedExistsSync.mockImplementation((filePath) => filePath === resolve('/test', '.changelogrc'))
    mockedReadFileSync.mockReturnValue(configContent)

    const config = getConfig()

    expect(config).toEqual({
      path: './docs/CHANGELOG.md',
    })
  })

  test('returns empty object when explicit path does not exist', () => {
    mockedExistsSync.mockReturnValue(false)

    const config = getConfig('./non-existent-config.json')

    expect(config).toEqual({})
  })

  test('parses YAML with quoted values', () => {
    const configContent = `
path: "./custom/CHANGELOG.md"
validation_level: 'warn'
`

    mockedExistsSync.mockReturnValue(true)
    mockedReadFileSync.mockReturnValue(configContent)

    const config = getConfig('.changelog-reader.yaml')

    expect(config).toEqual({
      path: './custom/CHANGELOG.md',
      validation_level: 'warn',
    })
  })

  test('parses YAML with boolean and numeric values', () => {
    const configContent = `
validation_depth: 15
some_bool: true
another_bool: false
`

    mockedExistsSync.mockReturnValue(true)
    mockedReadFileSync.mockReturnValue(configContent)

    const config = getConfig('.changelog-reader.yml')

    expect(config).toEqual({
      validation_depth: 15,
      some_bool: true,
      another_bool: false,
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

    const config = getConfig('.changelog-reader.yml')

    expect(config.path).toEqual('./CHANGELOG.md')
    expect(config.validation_level).toEqual('warn')
  })

  test('handles numeric edge cases correctly', () => {
    const configContent = `
integer_value: 42
negative_value: -10
decimal_value: 3.14
version_string: "1.2.3"
`

    mockedExistsSync.mockReturnValue(true)
    mockedReadFileSync.mockReturnValue(configContent)

    const config = getConfig('.changelog-reader.yml') as Record<string, unknown>

    expect(config.integer_value).toEqual(42)
    expect(config.negative_value).toEqual(-10)
    expect(config.decimal_value).toEqual(3.14)
    expect(config.version_string).toEqual('1.2.3')
  })

  test('returns empty object for empty YAML file', () => {
    const configContent = ``

    mockedExistsSync.mockReturnValue(true)
    mockedReadFileSync.mockReturnValue(configContent)

    const config = getConfig('.changelog-reader.yml')

    expect(config).toEqual({})
  })
})
