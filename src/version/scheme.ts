export type ReleaseDiff = 'major' | 'minor' | 'patch' | 'prerelease' | 'other'

/**
 * A versioning scheme strategy. Each supported scheme (SemVer, PEP 440, …)
 * provides one implementation; the pipeline and validation rules are written
 * against this interface and never branch on the scheme themselves.
 */
export interface VersionSchemeAdapter {
  readonly name: string
  isValid(raw: string): boolean
  isPrerelease(raw: string): boolean
  /** -1 | 0 | 1, or null when the inputs aren't comparable in this scheme. */
  compare(a: string, b: string): number | null
  /** The most significant differing segment, or null when undiffable. */
  diff(a: string, b: string): ReleaseDiff | null
}
