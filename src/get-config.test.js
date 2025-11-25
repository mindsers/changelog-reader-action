const fs = require('fs')
const path = require('path')
const { getConfig } = require('./get-config')

// Mock fs module
jest.mock('fs')

describe('getConfig', () => {
  const originalCwd = process.cwd

  beforeEach(() => {
    jest.clearAllMocks()
    process.cwd = () => '/test'
  })

  afterEach(() => {
    process.cwd = originalCwd
  })

  test('returns empty object when no config file exists', () => {
    fs.existsSync.mockReturnValue(false)
    const config = getConfig()
    expect(config).toEqual({})
  })

  test('loads config from explicit JSON path', () => {
    const configContent = JSON.stringify({
      path: './custom/CHANGELOG.md',
      validation_level: 'warn',
      validation_depth: 5,
    })

    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(configContent)

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

    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(configContent)

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

    fs.existsSync.mockImplementation(filePath => filePath === path.resolve('/test', '.changelog-reader.json'))
    fs.readFileSync.mockReturnValue(configContent)

    const config = getConfig()

    expect(config).toEqual({
      validation_level: 'warn',
    })
  })

  test('auto-discovers .changelog-reader.yml', () => {
    const configContent = `validation_level: error`

    fs.existsSync.mockImplementation(filePath => filePath === path.resolve('/test', '.changelog-reader.yml'))
    fs.readFileSync.mockReturnValue(configContent)

    const config = getConfig()

    expect(config).toEqual({
      validation_level: 'error',
    })
  })

  test('auto-discovers .changelogrc', () => {
    const configContent = JSON.stringify({
      path: './docs/CHANGELOG.md',
    })

    fs.existsSync.mockImplementation(filePath => filePath === path.resolve('/test', '.changelogrc'))
    fs.readFileSync.mockReturnValue(configContent)

    const config = getConfig()

    expect(config).toEqual({
      path: './docs/CHANGELOG.md',
    })
  })

  test('returns empty object when explicit path does not exist', () => {
    fs.existsSync.mockReturnValue(false)

    const config = getConfig('./non-existent-config.json')

    expect(config).toEqual({})
  })

  test('parses YAML with quoted values', () => {
    const configContent = `
path: "./custom/CHANGELOG.md"
validation_level: 'warn'
`

    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(configContent)

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

    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(configContent)

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
validation_level: warn # inline comments are not supported
`

    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(configContent)

    const config = getConfig('.changelog-reader.yml')

    expect(config.path).toEqual('./CHANGELOG.md')
    // Note: inline comments are treated as part of the value
    expect(config.validation_level).toEqual('warn # inline comments are not supported')
  })
})
