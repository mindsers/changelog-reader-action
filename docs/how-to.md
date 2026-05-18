<p align="center">
  <a href="https://github.com/actions/javascript-action/actions"><img alt="javscript-action status" src="https://github.com/actions/javascript-action/workflows/units-test/badge.svg"></a>
</p>

# Create a JavaScript Action

## Code in Develop

Install the dependencies:

```bash
$ npm install
```

Run the tests:

```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

## Change the Code

Most toolkit and CI/CD operations involve async operations so the action is run in an async function.

```javascript
const core = require('@actions/core');
...

async function run() {
  try {
      ...
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
```

See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

## Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos. Packaging the action will create a packaged action in the `dist` folder.

Run package:

```bash
npm run package
```

Since the packaged `index.js` is ran from the `dist` folder.

```bash
git add dist
```

## Create a release tags

Changelog Reader follow semantic versionning. So you have to create your tag.

```bash
$ git tag -s v1.0.3
```

To ease the work of maintainer we also create (or update) shortcut tags:

```bash
$ git tag -d v1
$ git push --delete origin v1
$ git tag -a v1
```

```bash
$ git push --tags
```

Now you have to create the GitHub Release for this new version (v1.0.3) and check "marketplace". This action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Usage

You can now consume the action by referencing the v1 branch:

```yaml
uses: actions/javascript-action@v1
with:
  milliseconds: 1000
```

See the [actions tab](https://github.com/actions/javascript-action/actions) for runs of this action! :rocket:
