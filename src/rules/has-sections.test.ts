import { makeEntry } from '../__fixtures__/entry.js'
import { hasSections } from './has-sections.js'

const POPULATED_SECTIONS = `### Fixed
  - Update types to allow no theme data into ThemeProvider.
  - **SECURITY** The list components don't use the nth-child CSS attributes in favor of nth-of-type.`

test('does not throw on populated or empty sections', () => {
  expect(() => hasSections(makeEntry('1.0.0', '### Added\r\n'))).not.toThrow()
  expect(() => hasSections(makeEntry('1.0.0', POPULATED_SECTIONS))).not.toThrow()
})

test('reports a missing-section-items error when no listed changes appear under a heading', () => {
  const output = hasSections(makeEntry('1.0.0', '### Added\r\n'))

  expect(output.type).toEqual('missing-section-items')
  if (output.type === 'missing-section-items') {
    expect(output.sectionType).toEqual('added')
    expect(output.entryID).toEqual('1.0.0')
  }
})

test('returns ok when every section has listed changes', () => {
  const output = hasSections(makeEntry('1.0.0', POPULATED_SECTIONS))

  expect(output.type).toEqual('ok')
})
