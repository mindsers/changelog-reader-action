import { makeEntry } from '../__fixtures__/entry.js'
import { pep440Adapter } from '../version/adapters/pep440.js'
import { semverAdapter } from '../version/adapters/semver.js'
import { isValidVersion } from './is-valid-version.js'

test('does not throw on valid or invalid input', () => {
  expect(() => isValidVersion(makeEntry('a.b.c'), semverAdapter)).not.toThrow()
  expect(() => isValidVersion(makeEntry('2.0.0'), semverAdapter)).not.toThrow()
})

test('returns invalid-version for an id invalid in the active scheme', () => {
  const output = isValidVersion(makeEntry('a.b.c'), semverAdapter)

  expect(output.type).toEqual('invalid-version')
  if (output.type === 'invalid-version') {
    expect(output.id).toEqual('a.b.c')
    expect(output.scheme).toEqual('semver')
  }
})

test('returns ok for a valid semantic id under semver', () => {
  expect(isValidVersion(makeEntry('2.0.0'), semverAdapter).type).toEqual('ok')
})

test('PEP 440 prerelease is invalid under semver but valid under pep440', () => {
  expect(isValidVersion(makeEntry('0.1.0a1'), semverAdapter).type).toEqual('invalid-version')
  expect(isValidVersion(makeEntry('0.1.0a1'), pep440Adapter).type).toEqual('ok')
})
