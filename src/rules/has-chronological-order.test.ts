import { makeEntry } from '../__fixtures__/entry.js'
import { pep440Adapter } from '../version/adapters/pep440.js'
import { semverAdapter } from '../version/adapters/semver.js'
import { hasChronologicalOrder } from './has-chronological-order.js'

test('does not throw on ordered or unordered input', () => {
  const ordered = () =>
    hasChronologicalOrder([makeEntry('1.0.0'), makeEntry('2.0.0')], 1, semverAdapter)
  const unordered = () =>
    hasChronologicalOrder([makeEntry('1.0.1'), makeEntry('1.0.0')], 1, semverAdapter)

  expect(ordered).not.toThrow()
  expect(unordered).not.toThrow()
})

test('returns out-of-order when versions are not chronological', () => {
  const output = hasChronologicalOrder([makeEntry('2.0.0'), makeEntry('1.0.0')], 1, semverAdapter)

  expect(output.type).toEqual('out-of-order')
  if (output.type === 'out-of-order') {
    expect(output.previous).toEqual('2.0.0')
    expect(output.current).toEqual('1.0.0')
  }
})

test('returns ok when versions are chronological', () => {
  const output = hasChronologicalOrder([makeEntry('1.0.0'), makeEntry('2.0.0')], 1, semverAdapter)

  expect(output.type).toEqual('ok')
})

test('orders PEP 440 versions under the pep440 scheme', () => {
  // 1.0.0a1 < 1.0.0 in PEP 440; in-order pair returns ok, reversed is flagged.
  expect(
    hasChronologicalOrder([makeEntry('1.0.0a1'), makeEntry('1.0.0')], 1, pep440Adapter).type
  ).toEqual('ok')
  expect(
    hasChronologicalOrder([makeEntry('1.0.0'), makeEntry('1.0.0a1')], 1, pep440Adapter).type
  ).toEqual('out-of-order')
})
