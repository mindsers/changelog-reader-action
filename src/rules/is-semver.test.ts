import { makeEntry } from '../__fixtures__/entry.js'
import { isSemVer } from './is-semver.js'

test('does not throw on valid or invalid input', () => {
  expect(() => isSemVer(makeEntry('a.b.c'))).not.toThrow()
  expect(() => isSemVer(makeEntry('2.0.0'))).not.toThrow()
})

test('returns invalid-semver for a non-semantic id', () => {
  const output = isSemVer(makeEntry('a.b.c'))

  expect(output.type).toEqual('invalid-semver')
  if (output.type === 'invalid-semver') {
    expect(output.id).toEqual('a.b.c')
  }
})

test('returns ok for a valid semantic id', () => {
  const output = isSemVer(makeEntry('2.0.0'))

  expect(output.type).toEqual('ok')
})
