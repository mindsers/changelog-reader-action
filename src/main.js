const utils = require('util')
const fs = require('fs')
const core = require('@actions/core')

const { parseEntry } = require('./parse-entry')
const { getEntries } = require('./get-entries')
const { getVersionById } = require('./get-version-by-id')

const readFile  = utils.promisify(fs.readFile)

exports.main = async function main() {
  try {
    const changelogPath = core.getInput('path') || './CHANGELOG.md'
    const targetVersion = core.getInput('version')

    if (targetVersion == null) {
      core.warning(`No target version specified. try to return the most recent one in the changelog file.`)
    }

    core.startGroup('Parse data')
    const rawData = await readFile(changelogPath)
    const versions = getEntries(rawData)
      .map(parseEntry)

    core.debug(`${version.length} version logs found`)
    core.endGroup()

    const version = getVersionById(versions, targetVersion)

    if (version == null) {
      core.error('No log entry found.')
      core.setOutput('log_entry', '')
      return
    }

    core.setOutput('log_entry', version.text)
  }
  catch (error) {
    core.setFailed(error.message)
  }
}
