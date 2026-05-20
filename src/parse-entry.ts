import type { Entry, EntryStatus } from './types.js'
import type { VersionSchemeAdapter } from './version/scheme.js'

const linkDefinitionRegex = /^\[.*\]:\s*http/
const placeholderRegex = /\[(.+?)\]\[\]/gi

export function parseEntry(entry: string, scheme: VersionSchemeAdapter): Entry {
  const [title = '', ...other] = entry.trim().split('\n')

  const [versionPart = '', datePart] = title.split(' - ')
  const versionNumber = versionPart.match(/[a-zA-Z0-9.\-+]+/)?.[0] ?? ''
  const versionDate = datePart != null ? datePart.match(/[0-9-]+/)?.[0] : undefined

  const body = other.filter((line) => !linkDefinitionRegex.test(line)).join('\n')
  const references = collectReferences(body)

  return {
    id: versionNumber,
    date: versionDate,
    status: computeStatus(versionNumber, title, scheme),
    body,
    references,
    text: body,
  }
}

function collectReferences(body: string): string[] {
  const seen = new Set<string>()
  for (const match of body.matchAll(placeholderRegex)) {
    const name = match[1]
    if (name !== undefined) {
      seen.add(name.toLowerCase())
    }
  }
  return Array.from(seen)
}

function computeStatus(version: string, title: string, scheme: VersionSchemeAdapter): EntryStatus {
  if (scheme.isPrerelease(version)) {
    return 'prereleased'
  }

  if (/\[yanked\]/i.test(title)) {
    return 'yanked'
  }

  // Accept both `[Unreleased]` and bare `Unreleased` (and case variants).
  if (/\bunreleased\b/i.test(title)) {
    return 'unreleased'
  }

  return 'released'
}
