export type EntryStatus = 'released' | 'prereleased' | 'unreleased' | 'yanked'

export type ValidationLevel = 'none' | 'warn' | 'error'

export interface Entry {
  id: string
  date: string | undefined
  status: EntryStatus
  text: string
}

export interface Section {
  type: string
  items: string[]
}

export type RuleResult = Record<string, unknown>

// Rules accept either a fully-built Entry (production path, where `text`
// holds the body) or a hand-rolled object with a `changes` field
// (validation tests have historically passed that shape). Tightening
// this into a single canonical input is a Phase 5 refactor.
export interface RuleEntry {
  id: string
  text?: string
  changes?: string
}

export interface Config {
  path?: string
  version?: string
  validation_level?: ValidationLevel
  validation_depth?: number
}
