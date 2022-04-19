const { getLinks } = require('./get-links')

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

const DATA_complex = `
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2+meta]
### Added
- The project has now a CHANGELOG

### Fixed
- README now uses the correct version number in the examples

## [1.1.1-rc.1+build.123] - 2020-02-12
### Fixed
- Remove template's old behavior

## [1.1.1-DEV-SNAPSHOT] - 2020-02-12
### Added
- CHANGELOG can be parsed by the github action

## [1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay] - 2019-12-09
### Added
- CHANGELOG can be parsed by the github action

[1.1.2+meta]: https://github.com/olivierlacan/keep-a-changelog/compare/v1.1.1-rc.1+build.123...1.1.2+meta
[1.1.1-rc.1+build.123]: https://github.com/mindsers/changelog-reader-action/compare/v1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay...v1.1.1-rc.1+build.123
[1.1.1-DEV-SNAPSHOT]: https://github.com/mindsers/changelog-reader-action/compare/v1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay...v1.1.1-DEV-SNAPSHOT
[1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay]: https://github.com/mindsers/changelog-reader-action/releases/tag/v1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay
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

const linkRegex =
  /^\[.+\]:\s?(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:\/?#[\]@!\$&'\(\)\*\+,;=.]+$/

test('retreive links from test (tag patern: vX.X.X)', () => {
  const output = getLinks(DATA_v)

  expect(output.length).toEqual(3)
  for (const text of output) {
    expect(text).toMatch(linkRegex)
  }
})

test('retreive links from test (tag patern: X.X.X)', () => {
  const output = getLinks(DATA)

  expect(output.length).toEqual(3)
  for (const text of output) {
    expect(text).toMatch(linkRegex)
  }
})

// https://github.com/mindsers/changelog-reader-action/issues/8
test('retreive links from test (complex SEMVER)', () => {
  const output = getLinks(DATA_complex)

  expect(output.length).toEqual(4)
  for (const text of output) {
    expect(text).toMatch(linkRegex)
  }
})
