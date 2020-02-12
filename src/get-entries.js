const versionSeparator = '\n## '

const avoidNonVersionData = version => /^\[v/.test(version)

exports.getEntries = (rawData) => {
    const content = String(rawData)

    return content
      .split(versionSeparator)
      .filter(avoidNonVersionData)
}
