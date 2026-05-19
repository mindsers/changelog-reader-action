import { diff, valid } from 'semver'

import { parseEntryContent } from '../parse-entry-content.js'
import type { Entry, RuleResult } from '../types.js'
import { ruleOk } from '../types.js'

const PATCH_ALLOWED: readonly string[] = ['fixed', 'security']
const MINOR_ALLOWED: readonly string[] = ['added', 'changed', 'deprecated', 'fixed', 'security']
const MAJOR_ALLOWED: readonly string[] = [
  'added',
  'removed',
  'changed',
  'deprecated',
  'fixed',
  'security',
]

export function hasCorrectSections(entries: Entry[], currentIndex: number): RuleResult {
  const currentEntry = entries[currentIndex]
  const previousEntry = entries[currentIndex - 1]

  if (previousEntry == null || currentEntry == null) {
    return ruleOk
  }

  if (!valid(previousEntry.id) || !valid(currentEntry.id)) {
    return ruleOk
  }

  const entryTypes = parseEntryContent(currentEntry.body).map((change) => change.type)
  const allowedTypes = getAllowedTypes(previousEntry.id, currentEntry.id)

  if (entryTypes.some((type) => !allowedTypes.includes(type))) {
    return {
      type: 'invalid-section-types',
      entryID: currentEntry.id,
      allowed: allowedTypes,
    }
  }

  return ruleOk
}

function getAllowedTypes(v1: string, v2: string): readonly string[] {
  const versionDiff = diff(v1, v2)

  switch (versionDiff) {
    case 'prepatch':
    case 'patch':
      return PATCH_ALLOWED
    case 'minor':
    case 'preminor':
      return MINOR_ALLOWED
    default:
      return MAJOR_ALLOWED
  }
}
