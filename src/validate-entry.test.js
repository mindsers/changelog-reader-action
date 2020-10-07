const { validateEntry } = require('./validate-entry')

const entryDescriptionMajor = `
### Added
- New attribute isOrdered on TextFieldList. Basicaly, <ol> becomes <ul> when not ordered.
- It is possible to change the row count of the TextField in TextFieldList.
- New attribute maxFieldCount on TextFieldList. It hides the add button when the value of maxFieldCount is reached.
- New DatePickerField component to display a date input.
- New attribute isSmall on TextField to display a smaller version of he TextField.

### Removed
- Legacy DatePicker library.

### Changed
- All form components can be updated using the value attribute.
- **BREACKING CHANGES** The default behavior of TextFieldList is to be "not ordered".
  You'll have to add the new isOrdered attribute on your existing components.
- FormErrors become FormErrorMessages.
- FormErrorMessages try to translate the error key automatically.
- ThemeProvider doesn't loads the font anymore. We created a more generic component (UIKitInitializer) that'll do it.
- FormErrorMessages filter error that are equal to false
- If an error is equal to en object instead of true, the object is passed to the translator as variables by FormErrorMessages.
- RadioButton and CheckboxButton support other type than string for their children attribute.

### Fixed
- Update types to allow no theme data into ThemeProvider.
- **SECURITY** The list components don't use the nth-child CSS attributes in favor of nth-of-type.
`

const entryDescriptionMinor = `
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

const entryDescriptionPatch = `
### Fixed
- Update types to allow no theme data into ThemeProvider.
- **SECURITY** The list components don't use the nth-child CSS attributes in favor of nth-of-type.
`

test('validate multiple versions without error', () => {
  const input = [
    { id: '1.0.0', changes: entryDescriptionMajor },
    { id: '1.0.1', changes: entryDescriptionPatch },
    { id: '1.1.0', changes: entryDescriptionMinor },
    { id: '2.0.0', changes: entryDescriptionMajor }
  ]
  const output = () => input.forEach(validateEntry)

  expect(output).not.toThrow()
})

test('throw error on version that is not semantic', () => {
  const input = [
    { id: '1.0.0', changes: entryDescriptionMajor },
    { id: '1.0.1', changes: entryDescriptionPatch },
    { id: 'a.b.c', changes: entryDescriptionMinor },
    { id: '2.0.0', changes: entryDescriptionMajor }
  ]
  const output = () => input.forEach(validateEntry)

  expect(output).toThrow('a.b.c is not a valid semantic version.')
})

test('no listed changes under the heading', () => {
  const input = [{ id: '1.0.0', changes: '### Added\r\n' }]
  const output = () => input.forEach(validateEntry)

  expect(output).toThrow('The \'added\' section under version 1.0.0 does not contain any listed changes under the heading.')
})

test('added section in patch release should throw error', () => {
  const input = [
    { id: '1.0.0', changes: entryDescriptionMajor },
    { id: '1.0.1', changes: entryDescriptionMajor }
  ]
  const output = () => input.forEach(validateEntry)

  expect(output).toThrow('The sections \'added, removed, changed\' under version 1.0.1 are not allowed in a patch release type.')
})

test('removed section in minor release should throw error', () => {
  const input = [
    { id: '1.0.0', changes: entryDescriptionMajor },
    { id: '1.1.0', changes: entryDescriptionMajor }
  ]
  const output = () => input.forEach(validateEntry)

  expect(output).toThrow('The section \'removed\' under version 1.1.0 is not allowed in a minor release type.')
})

test('an unknown section always throws an error', () => {
  const input = [{ id: '1.0.0', changes: '### Bugfixes\r\n' }]
  const output = () => input.forEach(validateEntry)

  expect(output).toThrow('The \'bugfixes\' section under version 1.0.0 does not contain any listed changes under the heading.')
})
