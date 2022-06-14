const { lt, valid } = require('semver')

exports.hasChronologicalOrder = function (entries, currentIndex) {
  const currentEntry = entries[currentIndex]
  const previousEntry = entries[currentIndex - 1]

  if (previousEntry == null) {
    return {}
  }

  if (!valid(previousEntry.id) || !valid(currentEntry.id)) {
    return {}
  }

  if (lt(previousEntry.id, currentEntry.id)) {
    return {}
  }

  return {
    'has-chronological-order': {
      previous: previousEntry.id,
      current: currentEntry.id,
    },
  }
}
