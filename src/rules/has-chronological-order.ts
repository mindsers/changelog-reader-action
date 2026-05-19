import { lt, valid } from 'semver'
import type { Entry, RuleResult } from '../types.js'
import { ruleOk } from '../types.js'

export function hasChronologicalOrder(entries: Entry[], currentIndex: number): RuleResult {
  const currentEntry = entries[currentIndex]
  const previousEntry = entries[currentIndex - 1]

  if (previousEntry == null || currentEntry == null) {
    return ruleOk
  }

  if (!valid(previousEntry.id) || !valid(currentEntry.id)) {
    return ruleOk
  }

  if (lt(previousEntry.id, currentEntry.id)) {
    return ruleOk
  }

  return { type: 'out-of-order', previous: previousEntry.id, current: currentEntry.id }
}
