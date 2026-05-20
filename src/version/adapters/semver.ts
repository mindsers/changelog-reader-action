import { compare, diff, prerelease, valid } from 'semver'

import type { VersionSchemeAdapter } from '../scheme.js'

export const semverAdapter: VersionSchemeAdapter = {
  name: 'semver',

  isValid(raw) {
    return valid(raw) !== null
  },

  isPrerelease(raw) {
    return prerelease(raw) !== null
  },

  compare(a, b) {
    if (valid(a) === null || valid(b) === null) {
      return null
    }
    return compare(a, b)
  },

  diff(a, b) {
    if (valid(a) === null || valid(b) === null) {
      return null
    }
    const result = diff(a, b)
    switch (result) {
      case 'major':
      case 'premajor':
        return 'major'
      case 'minor':
      case 'preminor':
        return 'minor'
      case 'patch':
      case 'prepatch':
        return 'patch'
      case 'prerelease':
        return 'prerelease'
      case null:
        return null
      default:
        return 'other'
    }
  },
}
