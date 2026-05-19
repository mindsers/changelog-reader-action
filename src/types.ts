export type EntryStatus = 'released' | 'prereleased' | 'unreleased' | 'yanked'

export type ValidationLevel = 'none' | 'warn' | 'error'

export interface Entry {
  id: string
  date: string | undefined
  status: EntryStatus
  body: string
  references: string[]
  text: string
}

export interface Section {
  type: string
  items: string[]
}

export type RuleResult =
  | { type: 'ok' }
  | { type: 'invalid-semver'; id: string }
  | { type: 'out-of-order'; previous: string; current: string }
  | { type: 'missing-section-items'; sectionType: string; entryID: string }
  | { type: 'invalid-section-types'; entryID: string; allowed: readonly string[] }

export const ruleOk: RuleResult = { type: 'ok' }

export interface Config {
  path?: string
  version?: string
  validation_level?: ValidationLevel
  validation_depth?: number
}
