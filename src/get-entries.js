const core = require('@actions/core')

const versionSeparator = /\n#{1,3}\s/
const semverLinkRegex = /^\[v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?\]/
const unreleasedLinkRegex = /^\[unreleased\]/i
const avoidNonVersionData = version => semverLinkRegex.test(version) || unreleasedLinkRegex.test(version)

exports.getEntries = rawData => {
    const content = String(rawData)

    core.debug(`CHANGELOG content: ${content}`)

    return content
      .split(versionSeparator)
      .filter(avoidNonVersionData)
}
