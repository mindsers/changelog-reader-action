import type { VersionSchemeAdapter } from './version/scheme.js'

const versionSeparator = '\n## '

// The leading token of an entry chunk: either bracketed (`[1.0.0] - date`,
// `[Unreleased]`) or a bare word (`Unreleased`).
function extractVersionToken(chunk: string): string | null {
  const bracketed = chunk.match(/^\[([^\]]+)\]/)
  if (bracketed?.[1] !== undefined) {
    return bracketed[1]
  }
  const bare = chunk.match(/^(\S+)/)
  return bare?.[1] ?? null
}

export function getEntries(rawData: Buffer | string, scheme: VersionSchemeAdapter): string[] {
  const content = String(rawData)

  return content.split(versionSeparator).filter((chunk) => {
    const token = extractVersionToken(chunk)
    if (token === null) {
      return false
    }
    if (/^unreleased$/i.test(token)) {
      return true
    }
    return scheme.isValid(token)
  })
}
