const versionSeparator = '\n## '

const avoidNonVersionData = version => /^\[v?[0-9]+(\.[0-9]+){0,2}\]/.test(version)

exports.getEntries = (rawData) => {
    const content = String(rawData)

    return content
      .split(versionSeparator)
      .filter(avoidNonVersionData)
}
