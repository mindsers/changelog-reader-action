# Changelog Reader

<a href="https://github.com/mindsers/changelog-reader-action"><img alt="changelog-reader-action status" src="https://github.com/mindsers/changelog-reader-action/workflows/units-test/badge.svg"></a>

A GitHub action to read and get data from the `CHANGELOG.md` file :rocket:

**This action only works if your `CHANGELOG.md` file follows the [_Keep a Changelog_](https://github.com/olivierlacan/keep-a-changelog) standard for now.**

## Usage

### Pre-requisites

Create a workflow `.yml` file in your repositories `.github/workflows` directory. An [example workflow](#example-workflow---upload-a-release-asset) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs

- `path`: The path the action can find the CHANGELOG. Optional. Defaults to `./CHANGELOG.md`.
- `version`: The [exact version](https://semver.org) of the log entry you want to retreive or "Unreleased" for the unreleased entry. Optional. Defaults to the last version number.
- `validation_level`: Specifies at which level the validation system is set. Can be 'none', 'warn', 'error'. Optional. Defaults to `none`.
- `validation_depth`: Specifies how many entries to validate in the CHANGELOG.md file. Optional. Defaults to `10`.

### Outputs

- `version`: Version of the log entry found. Ex: `2.0.0`.
- `date`: Release date of the log entry found. Ex: `2020-08-22`.
- `status`: Status of the log entry found (`prereleased`, `released`, `unreleased`, or `yanked`).
- `changes`: Description text of the log entry found.

### Validation / Linting

A validation engine is available in _Changelog Reader_. It is by default disabled but can be enabled by setting `validation_level` at 'warn' or 'error'.

The validation engine will enforce [Semantic Versioning 2.0.0](https://semver.org/) standards as well as [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) standards and formatting. **If your project doesn't follow Semantic Versioning 2.0.0 or Keep a Changelog, do not enable the validation engine.** It might your build unnecessarily.

You can utilize the `validation_depth` input param to specify how many entries to validate. Changelog Reader will by default validates only the last 10 changelog entries.

When `validation_level` is set at 'warn', Changelog Reader will print check results as warnings in your logs without breaking your build.
When `validation_level` is set at 'error', Changelog Reader will print check results as errors in your logs and will throw an error to prevent the build to go further.

### Example workflow - create a release from changelog

On every `push` to a tag matching the pattern `v*`, [create a release](https://developer.github.com/v3/repos/releases/#create-a-release) using the CHANGELOG.md content.
This Workflow example assumes you'll use the [`@actions/create-release`](https://www.github.com/actions/create-release) Action to create the release step:

```yaml
on:
  push:
    # Sequence of patterns matched against refs/tags
    tags:
      - 'v*' # Push events to matching v*, i.e. v1.0, v20.15.10

name: Create Release

jobs:
  build:
    name: Create Release
    runs-on: ubuntu-latest
    steps:
      - name: Get version from tag
        id: tag_name
        run: |
          echo ::set-output name=current_version::${GITHUB_REF#refs/tags/v}
        shell: bash
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Get Changelog Entry
        id: changelog_reader
        uses: mindsers/changelog-reader-action@v2
        with:
          validation_level: warn
          version: ${{ steps.tag_name.outputs.current_version }}
          path: ./CHANGELOG.md
      - name: Create/update release
        uses: ncipollo/release-action@v1
        with:
          # This pulls from the "Get Changelog Entry" step above, referencing it's ID to get its outputs object.
          # See this blog post for more info: https://jasonet.co/posts/new-features-of-github-actions/#passing-data-to-future-steps
          tag: ${{ steps.changelog_reader.outputs.version }}
          name: Release ${{ steps.changelog_reader.outputs.version }}
          body: ${{ steps.changelog_reader.outputs.changes }}
          prerelease: ${{ steps.changelog_reader.outputs.status == 'prereleased' }}
          draft: ${{ steps.changelog_reader.outputs.status == 'unreleased' }}
          allowUpdates: true
          token: ${{ secrets.GITHUB_TOKEN }}
```

## Contribution

Contributions to the source code of _Changelog Reader Action_ are welcomed and greatly appreciated.
For help on how to contribute in this project, please refer to [How to contribute to Changelog Reader Action](CONTRIBUTING.md).

To see the project's list of **awesome contributors**, please refer to our [Contributors Wall](CONTRIBUTORS.md).

## Support

_Changelog Reader Action_ is licensed under an MIT license, which means that it's a completely free open source software. Unfortunately, _Changelog Reader Action_ doesn't make itself. Version 2.0.0 is the next step, which will result in many late, beer-filled nights of development.

If you're using _Changelog Reader Action_ and want to support the development, you now have the chance! Go on my [GitHub Sponsor page](https://github.com/sponsors/mindsers) and become my joyful sponsor!!

For more help on how to support Changelog Reader Action, please refer to [The awesome people who support Changelog Reader Action](SPONSORS.md).

<!-- ### Premium sponsors -->

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
