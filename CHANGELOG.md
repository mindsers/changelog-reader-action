# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.3.0] - 2026-05-19

### Changed

- Use Node 24 as the action runtime.
- Refactor the internal entry, validation, and pipeline modules for type safety and easier maintenance. No change in observable behavior for action consumers.
- Modernize the bundled runtime dependencies: `@actions/core` 1.x → 2.x and the YAML parser 1.x → 2.x. The action's input/output contract is unchanged.

### Fixed

- Declare `semver` as a runtime dependency instead of a dev dependency.
- Stop dumping the full CHANGELOG content to debug logs when parsing entries and links.
- Detect the `Unreleased` heading case-insensitively when picking the most recent released entry.
- Warn (instead of silently degrading) when `validation_level` or `validation_depth` inputs are invalid; fall back to safe defaults.
- Warn (instead of silently using an empty config) when an explicit `config_file` does not exist.
- Validate the shape of YAML/JSON config files; warn on per-field type mismatches and reject non-object roots.
- Recognize bare `## Unreleased` headings in addition to the bracketed `## [Unreleased]` form.

## [2.2.3] - 2024-03-10

### Fixed

- Upgrade dependencies to solve deprecation issues.
- Use node v20
- Remove useless empty line between links in the body of a version

## [2.2.2] - 2022-11-23

### Fixed

- Upgrade dependencies to solve deprecation issues.

## [2.2.1] - 2022-11-10

### Fixed

- Change node engine for a non-deprecated version.

## [2.2.0] - 2022-09-01

### Changed

- Allow more section types into prerelease versions. #67

### Fixed

- Change the links' syntax to make them correctly recognized by GitHub.

## [2.1.1] - 2022-07-03

### Fixed

- The action was returning empty data since the last version. Now correctly returns selected entries data.

## [2.1.0] - 2022-06-14

### Added

- Introduced changelog validation to help keep the release version in line with [Semantic Versioning](https://semver.org/)
- New input param of `validation_level` and `validation_depth` to allow for configuration of changelog validation.
- Support Angular CHANGELOG format. (Doesn't force title emphasis)

### Changed

- The project now implement the [All Contributors](https://allcontributors.org).
  _This is not a change in the code but a change in how the projet recognize the
  external contributions._

### Fixed

- Retrieve links (external to the entry) and add them back in the related entry.

## [2.0.0] - 2020-08-30

### Added

- New output properties:
  - The `version` number of the returned entry
  - The released `date` of the returned entry
  - The `status` of the release based on the version number and the title line of the entry.
    Could be equal to `unreleased`, `prereleased`, `released` or `yanked`.
    Please refer to https://semver.org/#semantic-versioning-specification-semver for more informations about this.

### Changed

- **[BREAKING CHANGE]** If given a specific target version, action will now generate an error response if that version is not found in the changelog.
- **[BREAKING CHANGE]** `log_entry` output property is renamed to `changes`.

## [1.3.1] - 2020-07-08

### Fixed

- Allow developers to NOT use a date for each version entries.

## [1.3.0] - 2020-07-06

### Changed

- Dates should follow the format used in the ["Keep a Changelog"](https://keepachangelog.com/en/1.0.0/) specification
  which is `YYYY-MM-DD`. Another format that may work is `YYYY-DD-MM`.
  Given the current disclaimer in the `README.md`, this change is **not** a _breaking_ change.

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

[unreleased]: https://github.com/olivierlacan/keep-a-changelog/compare/v2.3.0...HEAD
[2.2.3]: https://github.com/mindsers/changelog-reader-action/compare/v2.2.3...v2.3.0
[2.2.3]: https://github.com/mindsers/changelog-reader-action/compare/v2.2.2...v2.2.3
[2.2.2]: https://github.com/mindsers/changelog-reader-action/compare/v2.2.1...v2.2.2
[2.2.1]: https://github.com/mindsers/changelog-reader-action/compare/v2.2.0...v2.2.1
[2.2.0]: https://github.com/mindsers/changelog-reader-action/compare/v2.1.1...v2.2.0
[2.1.1]: https://github.com/mindsers/changelog-reader-action/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/mindsers/changelog-reader-action/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/mindsers/changelog-reader-action/compare/v1.3.1...v2.0.0
[1.3.1]: https://github.com/mindsers/changelog-reader-action/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/mindsers/changelog-reader-action/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/mindsers/changelog-reader-action/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/mindsers/changelog-reader-action/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/mindsers/changelog-reader-action/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/mindsers/changelog-reader-action/releases/tag/v1.0.0
