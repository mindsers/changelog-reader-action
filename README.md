# Changelog Reader
<a href="https://github.com/mindsers/changelog-reader-action"><img alt="changelog-reader-action status" src="https://github.com/mindsers/changelog-reader-action/workflows/units-test/badge.svg"></a>

A Github action to read and get data from the `CHANGELOG.md` file :rocket:

**This action only work if your `CHANGELOG.md` file follows the [_Keep a Changelog_](https://github.com/olivierlacan/keep-a-changelog) standard for now.**

## Usage
### Pre-requisites
Create a workflow `.yml` file in your repositories `.github/workflows` directory. An [example workflow](#example-workflow---upload-a-release-asset) is available below. For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs

- `path`: The path the action can find the CHANGELOG. Optional. Defaults to `./CHANGELOG.md`.
- `version`: The exact version of the log entry you want to retreive or "Unreleased" for the unreleased entry. Optional. Defaults to the last version number.

### Outputs

- `log_entry`: The log entry found on the `CHANGELOG.md` file.

### Example workflow - upload a release asset
On every `push` to a tag matching the pattern `v*`, [create a release](https://developer.github.com/v3/repos/releases/#create-a-release) using the CHANGELOG.md content. This Workflow example assumes you'll use the [`@actions/create-release`](https://www.github.com/actions/create-release) Action to create the release step:

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
        env:
          GITHUB_REF: ${{ github.ref }}
        run: |
          export CURRENT_VERSION=${GITHUB_TAG/refs\/tags\/v/}
          echo "::set-env name=CURRENT_VERSION::$CURRENT_VERSION"
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Get Changelog Entry
        id: changelog_reader
        uses: mindsers/changelog-reader-action@v1.1.0
        with:
          version: ${{ env.CURRENT_VERSION }}
          path: ./CHANGELOG.md
      - name: Create Release
        id: create_release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: ${{ steps.changelog_reader.outputs.log_entry }} # This pulls from the GET CHANGELOG ENTRY step above, referencing it's ID to get its outputs object, which include a `log_entry`. See this blog post for more info: https://jasonet.co/posts/new-features-of-github-actions/#passing-data-to-future-steps
          draft: false
          prerelease: false
```

## Contribution

Contributions to the source code of *Changelog Reader Action* are welcomed and greatly appreciated. For help on how to contribute in this project, please refer to [How to contribute to Changelog Reader Action](CONTRIBUTING.md).

## Support

*Changelog Reader Action* is licensed under an MIT license, which means that it's a completely free open source software. Unfortunately, *Changelog Reader Action* doesn't make itself. Version 2.0.0 is the next step, which will result in many late, beer-filled nights of development.

If you're using *Changelog Reader Action* and want to support the development, you now have the chance! Go on my [Github Sponsor page](https://github.com/sponsors/mindsers) and become my joyful sponsor!!

For more help on how to support Changelog Reader Action, please refer to [The awesome people who support Changelog Reader Action](SPONSORS.md).

<!-- ### Premium sponsors -->

## License
The scripts and documentation in this project are released under the [MIT License](LICENSE)
