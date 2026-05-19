import { processChangelog } from './pipeline.js'

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

const INVALID_CHANGELOG = `# Changelog

## [1.0.0] - 2024-01-15

### Added

- This should be at the bottom

## [2.0.0] - 2023-06-01

### Added

- This should be at the top
`

test('returns the most recent released entry when no targetVersion is given', () => {
  const { entry, diagnostics } = processChangelog(HAPPY_CHANGELOG, {
    targetVersion: null,
    validationLevel: 'none',
    validationDepth: 10,
  })

  expect(entry.id).toEqual('2.0.0')
  expect(entry.date).toEqual('2024-01-15')
  expect(entry.status).toEqual('released')
  expect(diagnostics).toEqual([])
})

test('returns the requested entry when targetVersion matches', () => {
  const { entry } = processChangelog(HAPPY_CHANGELOG, {
    targetVersion: '1.0.0',
    validationLevel: 'none',
    validationDepth: 10,
  })

  expect(entry.id).toEqual('1.0.0')
  expect(entry.date).toEqual('2023-06-01')
})

test('throws when the requested version is not present', () => {
  expect(() =>
    processChangelog(HAPPY_CHANGELOG, {
      targetVersion: '9.9.9',
      validationLevel: 'none',
      validationDepth: 10,
    })
  ).toThrow(/No log entry found for version 9.9.9/)
})

test('returns the unreleased entry when targetVersion=Unreleased', () => {
  const { entry } = processChangelog(HAPPY_CHANGELOG, {
    targetVersion: 'Unreleased',
    validationLevel: 'none',
    validationDepth: 10,
  })

  expect(entry.id).toEqual('Unreleased')
  expect(entry.status).toEqual('unreleased')
})

test('propagates yanked status', () => {
  const { entry } = processChangelog(YANKED_CHANGELOG, {
    targetVersion: null,
    validationLevel: 'none',
    validationDepth: 10,
  })

  expect(entry.id).toEqual('2.0.0')
  expect(entry.status).toEqual('yanked')
})

test('propagates prereleased status', () => {
  const { entry } = processChangelog(PRERELEASED_CHANGELOG, {
    targetVersion: null,
    validationLevel: 'none',
    validationDepth: 10,
  })

  expect(entry.id).toEqual('2.0.0-alpha.1')
  expect(entry.status).toEqual('prereleased')
})

test('returns no diagnostics when validationLevel is none', () => {
  const { diagnostics } = processChangelog(INVALID_CHANGELOG, {
    targetVersion: null,
    validationLevel: 'none',
    validationDepth: 10,
  })

  expect(diagnostics).toEqual([])
})

test("flags warn-severity diagnostics under 'warn'", () => {
  const { entry, diagnostics } = processChangelog(INVALID_CHANGELOG, {
    targetVersion: null,
    validationLevel: 'warn',
    validationDepth: 10,
  })

  expect(entry.id).toEqual('1.0.0')
  expect(diagnostics.length).toBeGreaterThan(0)
  expect(diagnostics.every((d) => d.severity === 'warn')).toBe(true)
})

test("flags error-severity diagnostics under 'error'", () => {
  const { diagnostics } = processChangelog(INVALID_CHANGELOG, {
    targetVersion: null,
    validationLevel: 'error',
    validationDepth: 10,
  })

  expect(diagnostics.length).toBeGreaterThan(0)
  expect(diagnostics.every((d) => d.severity === 'error')).toBe(true)
})

test('appends resolved link definitions to entry.text when references appear', () => {
  const withReference = `# Changelog

## [1.0.0] - 2024-01-15

### Added

- See [unreleased][] for the upcoming work.

[unreleased]: https://github.com/foo/bar/compare/v1.0.0...HEAD
`

  const { entry } = processChangelog(withReference, {
    targetVersion: '1.0.0',
    validationLevel: 'none',
    validationDepth: 10,
  })

  expect(entry.text).toContain('[unreleased]: https://github.com/foo/bar/compare/v1.0.0...HEAD')
  expect(entry.body).not.toContain('[unreleased]: https')
})
