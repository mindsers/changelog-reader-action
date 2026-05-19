import { lt, valid } from 'semver'

import type { RuleEntry, RuleResult } from '../types.js'

export function hasChronologicalOrder(entries: RuleEntry[], currentIndex: number): RuleResult {
  const currentEntry = entries[currentIndex]
  const previousEntry = entries[currentIndex - 1]

  if (previousEntry == null || currentEntry == null) {
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
