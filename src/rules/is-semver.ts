import { valid } from 'semver'

import type { RuleEntry, RuleResult } from '../types.js'

export function isSemVer(entry: RuleEntry): RuleResult {
  if (valid(entry.id)) {
    return {}
  }

  return {
    'is-semver': true,
  }
}
