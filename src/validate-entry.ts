import { hasChronologicalOrder } from './rules/has-chronological-order.js'
import { hasCorrectSections } from './rules/has-correct-sections.js'
import { hasSections } from './rules/has-sections.js'
import { isSemVer } from './rules/is-semver.js'
import type { Entry, RuleResult, ValidationLevel } from './types.js'

export function validateEntry(
  validationLevel: ValidationLevel
): (entry: Entry, index: number, entries: Entry[]) => Error[] {
  return (entry, index, entries) => {
    if (validationLevel === 'none' || entry.status === 'unreleased') {
      return []
    }

    const results: RuleResult[] = [
      isSemVer(entry),
      hasChronologicalOrder(entries, index),
      hasSections(entry),
      hasCorrectSections(entries, index),
    ]

    return results
      .map((result) => formatError(result, entry))
      .filter((err): err is Error => err !== null)
  }
}

function formatError(result: RuleResult, entry: Entry): Error | null {
  switch (result.type) {
    case 'ok':
      return null
    case 'invalid-semver':
      return new Error(`${result.id} is not a valid semantic version.`)
    case 'out-of-order':
      return new Error(
        `Changelog versions out of order. Version ${result.current} cannot come after ${result.previous}.`
      )
    case 'missing-section-items':
      return new Error(
        `The '${result.sectionType}' section under version ${result.entryID} does not contain any listed changes under the heading.`
      )
    case 'invalid-section-types':
      return new Error(
        `Only '${result.allowed.join(', ')}' section${result.allowed.length === 1 ? '' : 's'} are allowed for version ${entry.id}.`
      )
  }
}
