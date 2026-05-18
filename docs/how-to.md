# Maintainer Guide

This document covers local development and releasing _Changelog Reader Action_.
For end-user documentation, see the [README](../README.md).

## Local development

Install dependencies and run the test suite:

```bash
npm ci
npm test
```

`npm test` runs ESLint over `src/` followed by the Jest suite. All tests live next
to the file they exercise (`src/foo.js` ↔ `src/foo.test.js`).

To rebuild the bundled action output after changing anything in `src/`:

```bash
npm run build
```

This runs `@vercel/ncc` to bundle `index.js` and its dependencies into a single
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

## Releasing a new version

The action follows [Semantic Versioning](https://semver.org/). Releases also
maintain a floating major-version tag (`v2`) so consumers can pin to
`mindsers/changelog-reader-action@v2` and pick up patches automatically.

1. Make sure the `Unreleased` section in `CHANGELOG.md` accurately reflects what
   you are about to ship; move its contents under a new
   `## [X.Y.Z] - YYYY-MM-DD` heading.
2. Bump the `version` field in `package.json`.
3. Commit the version bump and CHANGELOG update on `master`.
4. Tag the exact version and move the floating major tag:

   ```bash
   git tag -s vX.Y.Z -m "Release X.Y.Z"
   git tag -f vX
   git push origin vX.Y.Z
   git push origin vX --force
   ```

5. Create the matching GitHub Release for `vX.Y.Z`, with the new CHANGELOG
   section as the release body, and tick the "Publish this Action to the
   GitHub Marketplace" box.

For background on action versioning, see
[actions/toolkit's versioning guide](https://github.com/actions/toolkit/blob/main/docs/action-versioning.md).
