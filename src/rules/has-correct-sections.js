const { diff, valid } = require('semver')

const { parseEntryContent } = require('../parse-entry-content')

exports.hasCorrectSections = function (entries, currentIndex) {
  const currentEntry = entries[currentIndex]
  const previousEntry = entries[currentIndex - 1]

  if (previousEntry == null) {
    return {}
  }

  if (!valid(previousEntry.id) || !valid(currentEntry.id)) {
    return {}
  }

  const entryTypes = parseEntryContent(currentEntry.changes || currentEntry.text).map(
    change => change.type
  )
  const allowedTypes = getAllowedTypes(previousEntry.id, currentEntry.id)

  if (entryTypes.some(type => allowedTypes.indexOf(type) === -1)) {
    // Validates that only certain allowed types are in the change set
    return {
      'has-correct-sections': {
        entryID: currentEntry.id,
        types: allowedTypes,
      },
    }
  }

  return {}
}

function getAllowedTypes(v1, v2) {
  const versionDiff = diff(v1, v2)

  switch (versionDiff) {
    case 'prepatch':
    case 'patch':
      return ['fixed', 'security']
    case 'minor':
    case 'preminor':
      return ['added', 'changed', 'deprecated', 'fixed', 'security']
    case 'premajor':
    case 'major':
    default:
      return ['added', 'removed', 'changed', 'deprecated', 'fixed', 'security']
  }
}
