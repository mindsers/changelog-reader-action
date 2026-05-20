import type { VersionScheme } from '../types.js'
import { pep440Adapter } from './adapters/pep440.js'
import { semverAdapter } from './adapters/semver.js'
import type { VersionSchemeAdapter } from './scheme.js'

// Record<VersionScheme, …> makes the compiler enforce that every scheme in the
// VersionScheme union has a registered adapter. Adding a new scheme to the
// union won't compile until its adapter is added here.
const ADAPTERS: Record<VersionScheme, VersionSchemeAdapter> = {
  semver: semverAdapter,
  pep440: pep440Adapter,
}

export function resolveScheme(name: VersionScheme): VersionSchemeAdapter {
  return ADAPTERS[name]
}
