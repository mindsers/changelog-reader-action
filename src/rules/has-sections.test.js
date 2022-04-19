const { hasSections } = require('./has-sections')

test('no listed changes under the heading', () => {
  const output = hasSections({ id: '1.0.0', changes: '### Added\r\n' })

  expect(output['has-section']).toBeTruthy()
})

test('no listed changes under the heading', () => {
  const output = hasSections({
    id: '1.0.0',
    changes: `### Fixed
  - Update types to allow no theme data into ThemeProvider.
  - **SECURITY** The list components don't use the nth-child CSS attributes in favor of nth-of-type.`,
  })

  expect(output['has-section']).toBeFalsy()
})
