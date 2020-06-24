const { getEntries } = require('./get-entries')

const DATA_v = `
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- The project has now a CHANGELOG

### Fixed
- README now uses the correct version number in the examples

## [v1.0.1] - 2020-02-12
### Fixed
- Remove template's old behavior

## [v1.0.0] - 2020-02-12
### Added
- CHANGELOG can be parsed by the github action

[Unreleased]: https://github.com/olivierlacan/keep-a-changelog/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/mindsers/changelog-reader-action/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/mindsers/changelog-reader-action/releases/tag/v1.0.0
`

const DATA = `
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- The project has now a CHANGELOG

### Fixed
- README now uses the correct version number in the examples

## [1.0.1] - 2020-02-12
### Fixed
- Remove template's old behavior

## [1.0.0] - 2020-02-12
### Added
- CHANGELOG can be parsed by the github action

[Unreleased]: https://github.com/olivierlacan/keep-a-changelog/compare/v1.0.1...HEAD
[1.0.1]: https://github.com/mindsers/changelog-reader-action/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/mindsers/changelog-reader-action/releases/tag/v1.0.0
`

test('retreive entries from test (tag patern: vX.X.X)', () => {
  const output = getEntries(DATA_v)
  const versionRegex = /^\[(v[0-1]+|unreleased)/i

  expect(output.length).toEqual(3)
  expect(output[0]).toMatch(versionRegex)
  expect(output[1]).toMatch(versionRegex)
  expect(output[2]).toMatch(versionRegex)
})

test('retreive entries from test (tag patern: X.X.X)', () => {
  const output = getEntries(DATA)
  const versionRegex = /^\[([0-1]+|unreleased)/i

  expect(output.length).toEqual(3)
  expect(output[0]).toMatch(versionRegex)
  expect(output[1]).toMatch(versionRegex)
  expect(output[2]).toMatch(versionRegex)
})
