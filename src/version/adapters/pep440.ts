import { compare, explain, valid } from '@renovatebot/pep440'

import type { VersionSchemeAdapter } from '../scheme.js'

interface Pep440Explanation {
  release: number[]
  is_prerelease: boolean
  is_devrelease: boolean
}

function describe(raw: string): Pep440Explanation | null {
  if (valid(raw) === null) {
    return null
  }
  return explain(raw) as Pep440Explanation | null
}

export const pep440Adapter: VersionSchemeAdapter = {
  name: 'pep440',

  isValid(raw) {
    return valid(raw) !== null
  },

  isPrerelease(raw) {
    const info = describe(raw)
    // Both alpha/beta/rc ("a1", "rc2") and dev releases (".dev1") are
    // pre-stable; post releases (".post1") come after a release and are not.
    return info !== null && (info.is_prerelease || info.is_devrelease)
  },

  compare(a, b) {
    if (valid(a) === null || valid(b) === null) {
      return null
    }
    return compare(a, b)
  },

  diff(a, b) {
    const left = describe(a)
    const right = describe(b)
    if (left === null || right === null) {
      return null
    }

    const length = Math.max(left.release.length, right.release.length)
    for (let index = 0; index < length; index++) {
      const l = left.release[index] ?? 0
      const r = right.release[index] ?? 0
      if (l !== r) {
        if (index === 0) return 'major'
        if (index === 1) return 'minor'
        return 'patch'
      }
    }

    // Release segments are equal — any difference is in pre/dev/post.
    if (compare(a, b) !== 0) {
      return 'prerelease'
    }
    return 'other'
  },
}
