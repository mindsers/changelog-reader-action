const core = require('@actions/core')
const fs = require('fs')


// most @actions toolkit packages have async methods
async function run() {
  try {
    const changelogPath = core.getInput('path') || './CHANGELOG.md'
    const targetVersion = core.getInput('version')

    fs.readFile(changelogPath, (err, data) => {
      if (err) {
        core.setFailed(err.message)
        return
      }

      const versions = String(data)
        .split('\n## ')
        .filter(version => /^\[v/.test(version))
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
        const entry = versions.find(item => item.version === targetVersion)

        if (entry != null) {
          core.setOutput('logEntry', entry.log)
          return
        }
      }

      core.setOutput('logEntry', versions[0].log)
    })
  }
  catch (error) {
    core.setFailed(error.message)
  }
}

run()
