# Maintainer Guide

This document covers local development and releasing _Changelog Reader Action_.
For end-user documentation, see the [README](../README.md).

## Local development

Install dependencies and run the test suite:

```bash
npm ci
npm test
```

`npm test` runs Biome (lint + format check), TypeScript's type checker, and the
Vitest suite. All tests live next to the file they exercise
(`src/foo.ts` ↔ `src/foo.test.ts`).

To rebuild the bundled action output after changing anything in `src/`:

```bash
npm run build
```

This runs `@vercel/ncc` to bundle `index.ts` and its dependencies into a single
`dist/index.js` file. The `prepare` script in `package.json` runs the same
command automatically on `npm install`, so the bundle stays in sync as long as
you install before committing.

## Why `dist/` is committed

GitHub Actions written in JavaScript run directly from the action repository at
the SHA a consumer pins — there is no install step on the runner. The bundled
`dist/index.js` is therefore the artifact that actually executes for every
caller. CI enforces this with a drift check: after running the test suite, it
re-runs `npm run build` and fails if the result differs from what is committed.
If you see that step fail, run `npm run build` locally and commit the updated
bundle.

## CHANGELOG conventions

Each PR that introduces a user-visible change updates the `## [Unreleased]`
section of `CHANGELOG.md` directly, in
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/) style. Internal
maintenance (refactors, test-only changes, build tooling) does not need a
changelog entry.

## Releasing a new version

The action follows [Semantic Versioning](https://semver.org/). Releases
maintain a floating major-version tag (`v2`, `v3`, ...) so consumers pinned to
`mindsers/changelog-reader-action@v2` pick up new patch and minor versions
automatically.

The release process is driven by a tag-triggered workflow
(`.github/workflows/release.yml`): pushing a `vX.Y.Z` tag creates the GitHub
Release and moves the floating major tag in one shot.

1. On a branch (or directly on `master` if branch protection permits), make a
   single `release: vX.Y.Z` commit that:

   - Bumps the `version` field in `package.json` to `X.Y.Z`.
   - In `CHANGELOG.md`, renames the existing `## [Unreleased]` heading to
     `## [X.Y.Z] - YYYY-MM-DD` and adds a fresh empty `## [Unreleased]` heading
     above it.
   - Adds the new comparison link at the bottom of `CHANGELOG.md`:
     `[X.Y.Z]: https://github.com/mindsers/changelog-reader-action/compare/v<previous>...vX.Y.Z`.

2. Merge the release commit to `master`.

3. Tag and push:

   ```bash
   git tag -s vX.Y.Z <release-commit-sha> -m "Release vX.Y.Z"
   git push origin vX.Y.Z
   ```

4. The release workflow fires automatically and:

   - Validates the tag matches `package.json`'s version (fail-fast guard).
   - Extracts the `## [X.Y.Z]` section from `CHANGELOG.md` as the release body.
   - Creates the GitHub Release for `vX.Y.Z`.
   - Force-moves the floating major tag (e.g., `v2`) to point at the new
     release.

5. If the action is published to the GitHub Marketplace, edit the new Release
   on GitHub and tick the "Publish this Action to the GitHub Marketplace" box.
   This is a one-time UI step per release that the workflow cannot perform on
   your behalf.

The workflow only runs on `v*.*.*` tag pushes — it does not fire on regular
master pushes, PR merges, or any other event.

For background on action versioning, see
[actions/toolkit's versioning guide](https://github.com/actions/toolkit/blob/main/docs/action-versioning.md).
