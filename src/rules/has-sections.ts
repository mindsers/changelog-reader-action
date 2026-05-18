import { parseEntryContent } from '../parse-entry-content.js'

import type { RuleEntry, RuleResult } from '../types.js'

export function hasSections(entry: RuleEntry): RuleResult {
  const changes = parseEntryContent(entry.changes ?? entry.text ?? '')

  for (const change of changes) {
    if (change.items.length > 0) {
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
