# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- The following additional properties were added to action output: version, date, status.

### Changed
- **[BREAKING CHANGE]** If given a specific target version, action will now generate an error response if that version is not found in the changelog.
- Changed `log_entry` output property to `changes`.

## [1.3.1] - 2020-07-08
### Fixed
- Allow developers to NOT use a date for each version entries.

## [1.3.0] - 2020-07-06
### Changed
- Dates should follow the format used in the ["Keep a Changelog"](https://keepachangelog.com/en/1.0.0/) specification
  which is `YYYY-MM-DD`. Another format that may work is `YYYY-DD-MM`.
  Given the current disclaimer in the `README.md`, this change is **not** a *breaking* change.

### Fixed
- Improve SEMVER support. Now recognize complex version number based on https://semver.org.

## [1.2.0] - 2020-06-24
### Added
- New support for "Unreleased" section. It is possible to ask for the "Unreleased" section
  by setting `version: "Unreleased"` in the `workflow.yml` file.

### Fixed
- Improve the way the project is linted

## [1.1.0] - 2020-03-13
### Added
- The project has now a CHANGELOG
- Add logging message to make the debugging session easier

### Changed
- When no log entry is found, the error state of the action doesn't break the workflow anymore

### Fixed
- README now uses the correct version number in the examples
- Support X.X.X version pattern

## [1.0.1] - 2020-02-12
### Fixed
- Remove template's old behavior

## [1.0.0] - 2020-02-12
### Added
- CHANGELOG can be parsed by the github action

[Unreleased]: https://github.com/olivierlacan/keep-a-changelog/compare/v1.3.1...HEAD
[1.3.1]: https://github.com/mindsers/changelog-reader-action/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/mindsers/changelog-reader-action/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/mindsers/changelog-reader-action/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/mindsers/changelog-reader-action/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/mindsers/changelog-reader-action/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/mindsers/changelog-reader-action/releases/tag/v1.0.0
