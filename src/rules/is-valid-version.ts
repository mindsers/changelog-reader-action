import type { Entry, RuleResult } from '../types.js'
import { ruleOk } from '../types.js'
import type { VersionSchemeAdapter } from '../version/scheme.js'

export function isValidVersion(entry: Entry, scheme: VersionSchemeAdapter): RuleResult {
  return scheme.isValid(entry.id)
    ? ruleOk
    : { type: 'invalid-version', id: entry.id, scheme: scheme.name }
}
