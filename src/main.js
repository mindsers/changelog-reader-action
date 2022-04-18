const utils = require('util')
const fs = require('fs')
const core = require('@actions/core')

const { validateEntry } = require('./validate-entry')
const { parseEntry } = require('./parse-entry')
const { getEntries } = require('./get-entries')
const { getVersionById } = require('./get-version-by-id')

const readFile  = utils.promisify(fs.readFile)

exports.main = async function main() {
  try {
    const changelogPath = core.getInput('path') || './CHANGELOG.md'
    const targetVersion = core.getInput('version') || null
    const validationDepth = parseInt(core.getInput('validation_depth') || '0', 10)

    if (targetVersion == null) {
      core.warning(`No target version specified. Will try to return the most recent one in the changelog file.`)
    }

    core.startGroup('Parse data')
    const rawData = await readFile(changelogPath)
    const linkList = getLinks(rawData)
    const versions = getEntries(rawData)
      .map(parseEntry)

    if (validationDepth != 0)
    {
      const releasedVersions = versions.filter(version => version.status != 'unreleased')
      releasedVersions
        .reverse()
        .slice(Math.max(0, releasedVersions.length - validationDepth))
        .forEach(validateEntry)
    }

    core.debug(`${versions.length} version logs found`)
    core.endGroup()

    const version = getVersionById(versions, targetVersion)

    if (version == null) {
      throw new Error(`No log entry found${
        targetVersion != null
          ? ` for version ${targetVersion}`
          : ''
      }`)
    }

    core.setOutput('version', version.id)
    core.setOutput('date', version.date)
    core.setOutput('status', version.status)
    core.setOutput('changes', version.text)
  }
  catch (error) {
    core.setFailed(error.message)
  }
}
