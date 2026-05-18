// Factory mocks: @actions/core loads code from fs.promises at import time,
// which breaks when fs is auto-mocked. Pinning explicit shapes here keeps
// both mocks self-contained.
jest.mock('fs', () => ({
  readFile: jest.fn(),
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}))

jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
  startGroup: jest.fn(),
  endGroup: jest.fn(),
}))

const fs = require('fs')
const core = require('@actions/core')
const { main } = require('./main')

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

function setInputs(values) {
  core.getInput.mockImplementation(name => values[name] || '')
}

function setChangelogContents(contents) {
  // util.promisify(fs.readFile) calls fs.readFile with a Node-style
  // callback. Make the mock invoke that callback with the canned data.
  fs.readFile.mockImplementation((_path, cb) => cb(null, Buffer.from(contents)))
}

function getOutput(name) {
  const call = core.setOutput.mock.calls.find(([key]) => key === name)
  return call ? call[1] : undefined
}

describe('main', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default: no config file on disk.
    fs.existsSync.mockReturnValue(false)
  })

  test('returns the most recent released entry when no version input is given', async () => {
    setInputs({})
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(core.setFailed).not.toHaveBeenCalled()
    expect(getOutput('version')).toEqual('2.0.0')
    expect(getOutput('date')).toEqual('2024-01-15')
    expect(getOutput('status')).toEqual('released')
    expect(getOutput('changes')).toContain('Big change')
  })

  test('returns the requested version when version input matches an entry', async () => {
    setInputs({ version: '1.0.0' })
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(core.setFailed).not.toHaveBeenCalled()
    expect(getOutput('version')).toEqual('1.0.0')
    expect(getOutput('date')).toEqual('2023-06-01')
    expect(getOutput('status')).toEqual('released')
    expect(getOutput('changes')).toContain('First version')
  })

  test('fails when the requested version is not present', async () => {
    setInputs({ version: '9.9.9' })
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('No log entry found for version 9.9.9')
    )
  })

  test('returns the Unreleased entry when version=Unreleased', async () => {
    setInputs({ version: 'Unreleased' })
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(core.setFailed).not.toHaveBeenCalled()
    expect(getOutput('version')).toEqual('Unreleased')
    expect(getOutput('status')).toEqual('unreleased')
    expect(getOutput('changes')).toContain('Future feature')
  })

  test('reports yanked status for a yanked entry', async () => {
    setInputs({})
    setChangelogContents(YANKED_CHANGELOG)

    await main()

    expect(core.setFailed).not.toHaveBeenCalled()
    expect(getOutput('version')).toEqual('2.0.0')
    expect(getOutput('status')).toEqual('yanked')
  })

  test('reports prereleased status for a prerelease entry', async () => {
    setInputs({})
    setChangelogContents(PRERELEASED_CHANGELOG)

    await main()

    expect(core.setFailed).not.toHaveBeenCalled()
    expect(getOutput('version')).toEqual('2.0.0-alpha.1')
    expect(getOutput('status')).toEqual('prereleased')
  })

  test("skips validation when validation_level is 'none'", async () => {
    setInputs({ validation_level: 'none' })
    setChangelogContents(INVALID_CHANGELOG)

    await main()

    expect(core.setFailed).not.toHaveBeenCalled()
    expect(core.warning).not.toHaveBeenCalledWith(
      expect.stringContaining('Changelog versions out of order')
    )
    expect(core.error).not.toHaveBeenCalledWith(
      expect.stringContaining('Changelog versions out of order')
    )
  })

  test("logs warnings without failing when validation_level is 'warn'", async () => {
    setInputs({ validation_level: 'warn' })
    setChangelogContents(INVALID_CHANGELOG)

    await main()

    expect(core.setFailed).not.toHaveBeenCalled()
    expect(core.warning).toHaveBeenCalled()
    expect(getOutput('version')).toEqual('1.0.0')
  })

  test("fails the build when validation_level is 'error' and the changelog is invalid", async () => {
    setInputs({ validation_level: 'error' })
    setChangelogContents(INVALID_CHANGELOG)

    await main()

    expect(core.setFailed).toHaveBeenCalled()
  })

  test("does not fail when validation_level is 'error' and the changelog is valid", async () => {
    setInputs({ validation_level: 'error' })
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(core.setFailed).not.toHaveBeenCalled()
    expect(getOutput('version')).toEqual('2.0.0')
  })

  test('applies values from a config file when no overriding action input is set', async () => {
    setInputs({ config_file: '.changelog-reader.json' })
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(
      JSON.stringify({ version: '1.0.0', validation_level: 'none' })
    )
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(core.setFailed).not.toHaveBeenCalled()
    expect(getOutput('version')).toEqual('1.0.0')
    expect(getOutput('date')).toEqual('2023-06-01')
  })

  test('action input takes precedence over config file value', async () => {
    setInputs({ config_file: '.changelog-reader.json', version: '2.0.0' })
    fs.existsSync.mockReturnValue(true)
    fs.readFileSync.mockReturnValue(JSON.stringify({ version: '1.0.0' }))
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(getOutput('version')).toEqual('2.0.0')
  })

  test('uses the default changelog path when none is configured', async () => {
    setInputs({})
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(fs.readFile).toHaveBeenCalledWith('./CHANGELOG.md', expect.any(Function))
  })

  test('uses the configured changelog path when set via action input', async () => {
    setInputs({ path: './docs/CHANGELOG.md' })
    setChangelogContents(HAPPY_CHANGELOG)

    await main()

    expect(fs.readFile).toHaveBeenCalledWith('./docs/CHANGELOG.md', expect.any(Function))
  })
})
