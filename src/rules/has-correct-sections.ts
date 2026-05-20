import { parseEntryContent } from '../parse-entry-content.js'
import type { Entry, RuleResult } from '../types.js'
import { ruleOk } from '../types.js'
import type { ReleaseDiff, VersionSchemeAdapter } from '../version/scheme.js'

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

export function hasCorrectSections(
  entries: Entry[],
  currentIndex: number,
  scheme: VersionSchemeAdapter
): RuleResult {
  const currentEntry = entries[currentIndex]
  const previousEntry = entries[currentIndex - 1]

  if (previousEntry == null || currentEntry == null) {
    return ruleOk
  }

  const release = scheme.diff(previousEntry.id, currentEntry.id)
  if (release === null) {
    return ruleOk
  }

  const entryTypes = parseEntryContent(currentEntry.body).map((change) => change.type)
  const allowedTypes = allowedSectionsFor(release)

  if (entryTypes.some((type) => !allowedTypes.includes(type))) {
    return {
      type: 'invalid-section-types',
      entryID: currentEntry.id,
      allowed: allowedTypes,
    }
  }

  return ruleOk
}

function allowedSectionsFor(release: ReleaseDiff): readonly string[] {
  switch (release) {
    case 'patch':
      return PATCH_ALLOWED
    case 'minor':
      return MINOR_ALLOWED
    default:
      // major / prerelease / other → the most permissive set (preserves the
      // prior lenient behavior for prereleases and unusual bumps).
      return MAJOR_ALLOWED
  }
}
