import { resolveScheme } from './registry.js'

describe('semver adapter', () => {
  const semver = resolveScheme('semver')

  test('isValid', () => {
    expect(semver.isValid('1.2.3')).toBe(true)
    expect(semver.isValid('v1.2.3')).toBe(true)
    expect(semver.isValid('1.2.3-rc.1')).toBe(true)
    expect(semver.isValid('0.1.0a1')).toBe(false) // PEP 440, not SemVer
    expect(semver.isValid('1.0')).toBe(false)
    expect(semver.isValid('nope')).toBe(false)
  })

  test('isPrerelease', () => {
    expect(semver.isPrerelease('1.0.0-rc.1')).toBe(true)
    expect(semver.isPrerelease('1.0.0')).toBe(false)
  })

  test('compare', () => {
    expect(semver.compare('1.0.0', '2.0.0')).toBeLessThan(0)
    expect(semver.compare('2.0.0', '1.0.0')).toBeGreaterThan(0)
    expect(semver.compare('1.0.0', '1.0.0')).toBe(0)
    expect(semver.compare('nope', '1.0.0')).toBeNull()
  })

  test('diff', () => {
    expect(semver.diff('1.0.0', '2.0.0')).toBe('major')
    expect(semver.diff('1.0.0', '1.1.0')).toBe('minor')
    expect(semver.diff('1.0.0', '1.0.1')).toBe('patch')
    expect(semver.diff('1.0.0-rc.1', '1.0.0-rc.2')).toBe('prerelease')
    expect(semver.diff('nope', '1.0.0')).toBeNull()
  })
})

describe('pep440 adapter', () => {
  const pep440 = resolveScheme('pep440')

  test('isValid', () => {
    expect(pep440.isValid('0.1.0a1')).toBe(true)
    expect(pep440.isValid('1.0.0rc1')).toBe(true)
    expect(pep440.isValid('2.0.0.dev1')).toBe(true)
    expect(pep440.isValid('1.0.0.post1')).toBe(true)
    expect(pep440.isValid('1.0')).toBe(true)
    expect(pep440.isValid('2024.1')).toBe(true)
    expect(pep440.isValid('nope')).toBe(false)
  })

  test('isPrerelease', () => {
    expect(pep440.isPrerelease('0.1.0a1')).toBe(true)
    expect(pep440.isPrerelease('1.0.0rc1')).toBe(true)
    expect(pep440.isPrerelease('2.0.0.dev1')).toBe(true)
    // Post releases come AFTER a release, so they are not prereleases.
    expect(pep440.isPrerelease('1.0.0.post1')).toBe(false)
    expect(pep440.isPrerelease('1.0.0')).toBe(false)
  })

  test('compare', () => {
    expect(pep440.compare('1.0.0a1', '1.0.0')).toBeLessThan(0)
    expect(pep440.compare('1.0.0', '1.0.0a1')).toBeGreaterThan(0)
    expect(pep440.compare('1.0.0', '1.0.0')).toBe(0)
    expect(pep440.compare('nope', '1.0.0')).toBeNull()
  })

  test('diff', () => {
    expect(pep440.diff('1.0.0', '2.0.0')).toBe('major')
    expect(pep440.diff('1.0.0', '1.1.0')).toBe('minor')
    expect(pep440.diff('1.0.0', '1.0.1')).toBe('patch')
    expect(pep440.diff('1.0.0', '1.0.0a1')).toBe('prerelease')
    expect(pep440.diff('nope', '1.0.0')).toBeNull()
  })
})
