import { valid } from 'semver'
import type { Entry, RuleResult } from '../types.js'
import { ruleOk } from '../types.js'

export function isSemVer(entry: Entry): RuleResult {
  return valid(entry.id) ? ruleOk : { type: 'invalid-semver', id: entry.id }
}
