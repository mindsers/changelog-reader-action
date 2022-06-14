const { hasChronologicalOrder } = require('./has-chronological-order')

test('should not throw error', () => {
  const outputError = () => hasChronologicalOrder([{ id: '1.0.1' }, { id: '1.0.0' }], 1)
  const output = () => hasChronologicalOrder([{ id: '1.0.0' }, { id: '2.0.0' }], 1)

  expect(output).not.toThrow()
  expect(outputError).not.toThrow()
})

test('should return error when not chronological order', () => {
  const output = hasChronologicalOrder([{ id: '2.0.0' }, { id: '1.0.0' }], 1)

  expect(output['has-chronological-order']).toBeTruthy()
})

test('should not return error when chronological order', () => {
  const output = hasChronologicalOrder([{ id: '1.0.0' }, { id: '2.0.0' }], 1)

  expect(output['has-chronological-order']).toBeFalsy()
})
