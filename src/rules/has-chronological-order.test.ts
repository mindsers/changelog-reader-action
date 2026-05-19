import { makeEntry } from '../__fixtures__/entry.js'
import { hasChronologicalOrder } from './has-chronological-order.js'

test('does not throw on ordered or unordered input', () => {
  const ordered = () => hasChronologicalOrder([makeEntry('1.0.0'), makeEntry('2.0.0')], 1)
  const unordered = () => hasChronologicalOrder([makeEntry('1.0.1'), makeEntry('1.0.0')], 1)

  expect(ordered).not.toThrow()
  expect(unordered).not.toThrow()
})

test('returns out-of-order when versions are not chronological', () => {
  const output = hasChronologicalOrder([makeEntry('2.0.0'), makeEntry('1.0.0')], 1)

  expect(output.type).toEqual('out-of-order')
  if (output.type === 'out-of-order') {
    expect(output.previous).toEqual('2.0.0')
    expect(output.current).toEqual('1.0.0')
  }
})

test('returns ok when versions are chronological', () => {
  const output = hasChronologicalOrder([makeEntry('1.0.0'), makeEntry('2.0.0')], 1)

  expect(output.type).toEqual('ok')
})
