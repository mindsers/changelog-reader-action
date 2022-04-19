const { isSemVer } = require('./is-semver')

test('throw error on version that is not semantic', () => {
  const output = isSemVer({ id: 'a.b.c' })

  expect(output['is-semver']).toBeTruthy()
})

test('throw error on version that is not semantic', () => {
  const output = isSemVer({ id: '2.0.0' })

  expect(output['is-semver']).toBeFalsy()
})
