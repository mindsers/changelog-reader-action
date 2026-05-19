import * as core from '@actions/core'

import { hasChronologicalOrder } from './rules/has-chronological-order.js'
import { hasCorrectSections } from './rules/has-correct-sections.js'
import { hasSections } from './rules/has-sections.js'
import { isSemVer } from './rules/is-semver.js'
import type { RuleEntry, ValidationLevel } from './types.js'

interface ChronologicalDetails {
  previous: string
  current: string
}

interface SectionDetails {
  type: string
  entryID: string
}

interface CorrectSectionsDetails {
  entryID: string
  types: string[]
}

// `entry` accepts the production Entry shape (id + status + text) AND the
// historical test-fixture shape ({ id, changes, status? }). status may be
// absent on hand-rolled fixtures; treat absent as "not unreleased".
type ValidatableEntry = RuleEntry & { status?: string }

export function validateEntry(
  validationLevel: ValidationLevel
): (entry: ValidatableEntry, index: number, entries: ValidatableEntry[]) => void {
  return (entry, index, entries) => {
    if (entry.status === 'unreleased') return

    const validationResults: Record<string, unknown> = {
      ...isSemVer(entry),
      ...hasChronologicalOrder(entries, index),
      ...hasSections(entry),
      ...hasCorrectSections(entries, index),
    }

    const errors = Object.keys(validationResults)
      .filter((key) => validationResults[key] !== false)
      .map((key) => buildError(key, validationResults[key], entry))
      .filter((err): err is Error => err !== undefined)

    const shouldBreakTheBuild = validationLevel === 'error'
    const log = shouldBreakTheBuild ? core.error : core.warning
    for (const error of errors) {
      log(error)
    }

    if (errors.length > 0 && shouldBreakTheBuild) {
      throw new AggregateError(errors, `${entry.id} entry is invalid.`)
    }
  }
}

function buildError(key: string, detail: unknown, entry: ValidatableEntry): Error | undefined {
  if (key === 'is-semver') {
    return new Error(`${entry.id} is not a valid semantic version.`)
  }

  if (key === 'has-chronological-order') {
    const { current, previous } = detail as ChronologicalDetails
    return new Error(
      `Changelog versions out of order. Version ${current} cannot come after ${previous}.`
    )
  }

  if (key === 'has-section') {
    const { type, entryID } = detail as SectionDetails
    return new Error(
      `The '${type}' section under version ${entryID} does not contain any listed changes under the heading.`
    )
  }

  if (key === 'has-correct-sections') {
    const { entryID, types } = detail as CorrectSectionsDetails
    return new Error(
      `Only '${types.join(', ')}' section${
        types.length === 1 ? '' : 's'
      } are allowed for version ${entryID}.`
    )
  }

  return undefined
}
