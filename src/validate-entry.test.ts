import { makeEntry } from './__fixtures__/entry.js'
import { validateEntry } from './validate-entry.js'

const entryBodyMajor = `
### Added
- New attribute isOrdered on TextFieldList. Basicaly, <ol> becomes <ul> when not ordered.
- It is possible to change the row count of the TextField in TextFieldList.
- New attribute maxFieldCount on TextFieldList. It hides the add button when the value of maxFieldCount is reached.
- New DatePickerField component to display a date input.
- New attribute isSmall on TextField to display a smaller version of he TextField.

### Fixed
- Update types to allow no theme data into ThemeProvider.
- **SECURITY** The list components don't use the nth-child CSS attributes in favor of nth-of-type.
`

const entryBodyMinor = entryBodyMajor

const entryBodyPatch = `
### Fixed
- Update types to allow no theme data into ThemeProvider.
- **SECURITY** The list components don't use the nth-child CSS attributes in favor of nth-of-type.
`

function collectErrors(level: 'warn' | 'error', entries: ReturnType<typeof makeEntry>[]): Error[] {
  const run = validateEntry(level)
  return entries.flatMap((entry, index, arr) => run(entry, index, arr))
}

test('returns no errors for a valid changelog history', () => {
  const errors = collectErrors('error', [
    makeEntry('1.0.0', entryBodyMajor),
    makeEntry('1.0.1', entryBodyPatch),
    makeEntry('1.1.0', entryBodyMinor),
    makeEntry('2.0.0', entryBodyMajor),
  ])

  expect(errors).toEqual([])
})

test('returns errors when an entry id is not a valid semantic version', () => {
  const errors = collectErrors('error', [
    makeEntry('1.0.0', entryBodyMajor),
    makeEntry('1.0.1', entryBodyPatch),
    makeEntry('a.b.c', entryBodyMinor),
    makeEntry('2.0.0', entryBodyMajor),
  ])

  expect(errors.length).toBeGreaterThan(0)
  expect(errors.some((e) => e.message.includes('a.b.c'))).toBe(true)
})

test("reports the same errors under 'warn' as under 'error'", () => {
  const inputs = [
    makeEntry('1.0.0', entryBodyMajor),
    makeEntry('1.0.1', entryBodyPatch),
    makeEntry('a.b.c', entryBodyMinor),
    makeEntry('2.0.0', entryBodyMajor),
  ]

  const errorMessages = collectErrors('error', inputs).map((e) => e.message)
  const warnMessages = collectErrors('warn', inputs).map((e) => e.message)

  expect(warnMessages).toEqual(errorMessages)
})

test("returns no errors when level is 'none'", () => {
  const errors = collectErrors('none' as 'warn', [
    makeEntry('a.b.c', entryBodyMinor),
    makeEntry('1.0.0', entryBodyMajor),
  ])

  expect(errors).toEqual([])
})
