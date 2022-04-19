const { prerelease } = require('semver')

exports.parseEntry = entry => {
  const [title, ...other] = entry.trim().split('\n')

  const [versionPart, datePart] = title.split(' - ')
  const [versionNumber] = versionPart.match(/[a-zA-Z0-9.\-+]+/)
  const [versionDate] = (datePart != null && datePart.match(/[0-9-]+/)) || []

  return {
    id: versionNumber,
    date: versionDate,
    status: computeStatus(versionNumber, title),
    text: other.filter(item => !/\[.*\]: http/.test(item)).join('\n'),
  }
}

function computeStatus(version, title) {
  if (prerelease(version)) {
    return 'prereleased'
  }

  if (title.match(/\[yanked\]/i)) {
    return 'yanked'
  }

  if (title.match(/\[unreleased\]/i)) {
    return 'unreleased'
  }

  return 'released'
}
