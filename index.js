const utils = require('util')
const fs = require('fs')
const core = require('@actions/core')

const readFile  = utils.promisify(fs.readFile)

const avoidNonVersionData = version => /^\[v/.test(version)
const versionSeparator = '\n## '

// most @actions toolkit packages have async methods
async function run() {
  try {
    const changelogPath = core.getInput('path') || './CHANGELOG.md'
    const targetVersion = core.getInput('version')

    const rawData = await readFile(changelogPath)
    const content = String(rawData)
    const parsedContent = content
      .split(versionSeparator)
      .filter(avoidNonVersionData)
      .map(version => {
        const [title, ...other] = version.split('\n')
        const [versionNumber, versionDate] = title.replace(/(\[|\])/g, '').split(' - ')
        return {
          version: versionNumber,
          date: versionDate,
          log: other
            .filter(item => !/\[.*\]: http/
            .test(item)).join('\n')
        }
      })

    if (targetVersion != null) {
      const entry = parsedContent.find(item => item.version === targetVersion)

      if (entry != null) {
        core.setOutput('logEntry', entry.log)
        return
      }
    }

    core.setOutput('logEntry', parsedContent[0].log)
  }
  catch (error) {
    core.setFailed(error.message)
  }
}

run()
