const utils = require('util')
const fs = require('fs')
const core = require('@actions/core')

const { validateEntry } = require('./validate-entry')
const { parseEntry } = require('./parse-entry')
const { getEntries } = require('./get-entries')
const { getVersionById: getEntryByVersionID } = require('./get-version-by-id')

const readFile = utils.promisify(fs.readFile)

exports.main = async function main() {
  try {
    const changelogPath = core.getInput('path') || './CHANGELOG.md'
    const targetVersion = core.getInput('version') || null
    const validationLevel = core.getInput('validation_level') || 'none'

    if (targetVersion == null) {
      core.warning(
        `No target version specified. Will try to return the most recent one in the changelog file.`
      )
    }

    // Parse data
    core.startGroup('Parse data')
    const rawData = await readFile(changelogPath)
    const entries = getEntries(rawData).map(parseEntry)

    core.debug(`${entries.length} version logs found`)
    core.endGroup()

    // Validate data
    core.startGroup('Validate data')
    if (validationLevel === 'none') {
      core.info(`Validation level set to 'none'. Skipping validation.`)
    }

    if (validationLevel !== 'none') {
      const validationDepth = parseInt(core.getInput('validation_depth'), 10)

      entries
        .filter(version => version.status != 'unreleased')
        .reverse()
        .slice(Math.max(0, releasedVersions.length - validationDepth))
        .forEach(validateEntry(validationLevel))
    }
    core.endGroup()

    // Return data
    const entry = getEntryByVersionID(entries, targetVersion)

    if (entry == null) {
      throw new Error(
        `No log entry found${targetVersion != null ? ` for version ${targetVersion}` : ''}`
      )
    }

    core.setOutput('version', entry.id)
    core.setOutput('date', entry.date)
    core.setOutput('status', entry.status)
    core.setOutput('changes', entry.text)
  } catch (error) {
    core.setFailed(error.message)
  }
}
