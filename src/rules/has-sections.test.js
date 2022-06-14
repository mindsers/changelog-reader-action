const { hasSections } = require('./has-sections')

test('should not throw error', () => {
  const outputError = () => hasSections({ id: '1.0.0', changes: '### Added\r\n' })
  const output = () =>
    hasSections({
      id: '1.0.0',
      changes: `### Fixed
  - Update types to allow no theme data into ThemeProvider.
  - **SECURITY** The list components don't use the nth-child CSS attributes in favor of nth-of-type.`,
    })

  expect(outputError).not.toThrow()
  expect(output).not.toThrow()
})

test('should return error when no listed changes under the heading', () => {
  const output = hasSections({ id: '1.0.0', changes: '### Added\r\n' })

  expect(output['has-section']).toBeTruthy()
})

test('should not return error when listed changes under the heading', () => {
  const output = hasSections({
    id: '1.0.0',
    changes: `### Fixed
  - Update types to allow no theme data into ThemeProvider.
  - **SECURITY** The list components don't use the nth-child CSS attributes in favor of nth-of-type.`,
  })

  expect(output['has-section']).toBeFalsy()
})
