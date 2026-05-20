import { buildLinkRegistry, resolveLinks } from './add-links.js'
import { getEntries } from './get-entries.js'
import { getEntryByVersionID } from './get-entry-by-version-id.js'
import { getLinks } from './get-links.js'
import { parseEntry } from './parse-entry.js'
import type { Entry, ValidationLevel } from './types.js'
import { validateEntry } from './validate-entry.js'
import type { VersionSchemeAdapter } from './version/scheme.js'

export interface PipelineOptions {
  targetVersion?: string | null
  validationLevel: ValidationLevel
  validationDepth: number
  scheme: VersionSchemeAdapter
}

export interface PipelineDiagnostic {
  severity: 'warn' | 'error'
  message: string
}

export interface PipelineResult {
  entry: Entry
  diagnostics: PipelineDiagnostic[]
}

export function processChangelog(
  rawData: Buffer | string,
  options: PipelineOptions
): PipelineResult {
  const registry = buildLinkRegistry(getLinks(rawData))
  const versions = getEntries(rawData, options.scheme)
    .map((entry) => parseEntry(entry, options.scheme))
    .map(resolveLinks(registry))

  const diagnostics: PipelineDiagnostic[] = []

  if (options.validationLevel !== 'none') {
    const released = versions.filter((entry) => entry.status !== 'unreleased')
    const window = released.reverse().slice(Math.max(0, released.length - options.validationDepth))
    const runRule = validateEntry(options.validationLevel, options.scheme)
    const severity: PipelineDiagnostic['severity'] =
      options.validationLevel === 'error' ? 'error' : 'warn'

    window.forEach((entry, index, arr) => {
      for (const err of runRule(entry, index, arr)) {
        diagnostics.push({ severity, message: err.message })
      }
    })
  }

  const entry = getEntryByVersionID(versions, options.targetVersion)
  if (entry == null) {
    throw new Error(
      `No log entry found${options.targetVersion != null ? ` for version ${options.targetVersion}` : ''}`
    )
  }

  return { entry, diagnostics }
}
