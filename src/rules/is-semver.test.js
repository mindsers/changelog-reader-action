const { isSemVer } = require('./is-semver')

test('should not throw error', () => {
  const outputError = () => isSemVer({ id: 'a.b.c' })
  const outputNoError = () => isSemVer({ id: '2.0.0' })

  expect(outputError).not.toThrow()
  expect(outputNoError).not.toThrow()
})

test('should return error on version that is not semantic', () => {
  const output = isSemVer({ id: 'a.b.c' })

  expect(output['is-semver']).toBeTruthy()
})

test('should not return error on version that is not semantic', () => {
  const output = isSemVer({ id: '2.0.0' })

  expect(output['is-semver']).toBeFalsy()
})
