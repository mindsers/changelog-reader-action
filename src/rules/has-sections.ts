import { parseEntryContent } from '../parse-entry-content.js'
import type { Entry, RuleResult } from '../types.js'
import { ruleOk } from '../types.js'

export function hasSections(entry: Entry): RuleResult {
  const changes = parseEntryContent(entry.body)

  for (const change of changes) {
    if (change.items.length > 0) {
      continue
    }

    return {
      type: 'missing-section-items',
      sectionType: change.type,
      entryID: entry.id,
    }
  }

  return ruleOk
}
