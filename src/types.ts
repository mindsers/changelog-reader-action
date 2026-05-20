export type EntryStatus = 'released' | 'prereleased' | 'unreleased' | 'yanked'

export const VALIDATION_LEVELS = ['none', 'warn', 'error'] as const

export type ValidationLevel = (typeof VALIDATION_LEVELS)[number]

export function isValidationLevel(value: unknown): value is ValidationLevel {
  return typeof value === 'string' && (VALIDATION_LEVELS as readonly string[]).includes(value)
}

export const VERSION_SCHEMES = ['semver', 'pep440'] as const

export type VersionScheme = (typeof VERSION_SCHEMES)[number]

export function isVersionScheme(value: unknown): value is VersionScheme {
  return typeof value === 'string' && (VERSION_SCHEMES as readonly string[]).includes(value)
}

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
  | { type: 'invalid-version'; id: string; scheme: string }
  | { type: 'out-of-order'; previous: string; current: string }
  | { type: 'missing-section-items'; sectionType: string; entryID: string }
  | { type: 'invalid-section-types'; entryID: string; allowed: readonly string[] }

export const ruleOk = { type: 'ok' } as const satisfies RuleResult

export interface Config {
  path?: string
  version?: string
  validation_level?: ValidationLevel
  validation_depth?: number
  version_scheme?: VersionScheme
}
