const { parseEntryContent } = require('../parse-entry-content')

exports.hasSections = function (entry) {
  const changes = parseEntryContent(entry.changes || entry.text)

  for (const change of changes) {
    if (change.items.length > 0) {
      // Validate that there are changes listed under each section
      continue
    }

    return {
      'has-section': {
        type: change.type,
        entryID: entry.id,
      },
    }
  }

  return {}
}
