const { prerelease } = require('semver')

exports.parseEntry = entry => {
  const [title, ...other] = entry
    .trim()
    .split('\n')

  const [versionPart, datePart] = title.split(' - ')
  const [versionNumber] = versionPart.match(/[a-zA-Z0-9.\-+]+/)
  const [versionDate] = datePart != null && datePart.match(/[0-9-]+/) || []
  const status = prerelease(versionNumber)
    ? 'prereleased'
    : title.match(/\[yanked\]/i)
      ? 'yanked'
      : title.match(/\[unreleased\]/i)
        ? 'unreleased'
        : 'released'

  return {
    id: versionNumber,
    date: versionDate,
    status: status,
    changes: other
      .filter(item => !/\[.*\]: http/.test(item))
      .join('\n')
  }
}
