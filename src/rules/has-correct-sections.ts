import { diff, valid } from 'semver'

import { parseEntryContent } from '../parse-entry-content.js'
import type { RuleEntry, RuleResult } from '../types.js'

export function hasCorrectSections(entries: RuleEntry[], currentIndex: number): RuleResult {
  const currentEntry = entries[currentIndex]
  const previousEntry = entries[currentIndex - 1]

  if (previousEntry == null || currentEntry == null) {
    return {}
  }

  if (!valid(previousEntry.id) || !valid(currentEntry.id)) {
    return {}
  }

  const entryTypes = parseEntryContent(currentEntry.changes ?? currentEntry.text ?? '').map(
    (change) => change.type
  )
  const allowedTypes = getAllowedTypes(previousEntry.id, currentEntry.id)

  if (entryTypes.some((type) => !allowedTypes.includes(type))) {
    return {
      'has-correct-sections': {
        entryID: currentEntry.id,
        types: allowedTypes,
      },
    }
  }

  return {}
}

function getAllowedTypes(v1: string, v2: string): string[] {
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
