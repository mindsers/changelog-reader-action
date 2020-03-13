const core = require('@actions/core')

const versionSeparator = '\n## '
const avoidNonVersionData = version => /^\[v?[0-9]+(\.[0-9]+){0,2}\]/.test(version)

exports.getEntries = (rawData) => {
    const content = String(rawData)

    core.debug(`CHANGELOG content: ${content}`)

    return content
      .split(versionSeparator)
      .filter(avoidNonVersionData)
}
