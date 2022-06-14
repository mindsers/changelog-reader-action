const utils = require('util')
const fs = require('fs')
const core = require('@actions/core')

const { validateEntry } = require('./validate-entry')
const { parseEntry } = require('./parse-entry')
const { getEntries } = require('./get-entries')
const { getEntryByVersionID } = require('./get-entry-by-version-id')
const { getLinks } = require('./get-links')
const { addLinks } = require('./add-links')

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
    const linkList = getLinks(rawData)
    const versions = getEntries(rawData).map(parseEntry).map(addLinks(linkList))

    core.debug(`${versions.length} version logs found`)
    core.endGroup()

    // Validate data
    core.startGroup('Validate data')
    if (validationLevel === 'none') {
      core.info(`Validation level set to 'none'. Skipping validation.`)
    }

    if (validationLevel !== 'none') {
      const validationDepth = parseInt(core.getInput('validation_depth'), 10)

      versions
        .filter(version => version.status != 'unreleased')
        .reverse()
        .slice(Math.max(0, releasedVersions.length - validationDepth))
        .forEach(validateEntry(validationLevel))
    }
    core.endGroup()

    // Return data
    const entry = getEntryByVersionID(versions, targetVersion)

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
