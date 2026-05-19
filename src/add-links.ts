import type { Entry } from './types.js'

const linkDefinitionRegex = /^\[(.+?)\]:\s*http/

export function buildLinkRegistry(linkLines: string[]): Map<string, string> {
  const registry = new Map<string, string>()
  for (const line of linkLines) {
    const match = line.match(linkDefinitionRegex)
    const name = match?.[1]
    if (name !== undefined) {
      registry.set(name.toLowerCase(), line)
    }
  }
  return registry
}

export function resolveLinks(registry: Map<string, string>): (entry: Entry) => Entry {
  return (entry) => {
    if (entry.references.length === 0) {
      return entry
    }
    const resolved: string[] = []
    for (const name of entry.references) {
      const line = registry.get(name)
      if (line !== undefined) {
        resolved.push(line)
      }
    }
    if (resolved.length === 0) {
      return entry
    }
    return { ...entry, text: `${entry.body}\n${resolved.join('\n')}` }
  }
}
