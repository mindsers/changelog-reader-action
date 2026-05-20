import type { Entry, RuleResult } from '../types.js'
import { ruleOk } from '../types.js'
import type { VersionSchemeAdapter } from '../version/scheme.js'

export function hasChronologicalOrder(
  entries: Entry[],
  currentIndex: number,
  scheme: VersionSchemeAdapter
): RuleResult {
  const currentEntry = entries[currentIndex]
  const previousEntry = entries[currentIndex - 1]

  if (previousEntry == null || currentEntry == null) {
    return ruleOk
  }

  const order = scheme.compare(previousEntry.id, currentEntry.id)
  // null = incomparable in this scheme (e.g. an invalid id); skip.
  if (order === null || order < 0) {
    return ruleOk
  }

  return { type: 'out-of-order', previous: previousEntry.id, current: currentEntry.id }
}
