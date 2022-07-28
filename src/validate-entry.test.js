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

test('validate multiple versions', () => {
  const input = [
    { id: '1.0.0', changes: entryDescriptionMajor },
    { id: '1.0.1', changes: entryDescriptionPatch },
    { id: '1.1.0', changes: entryDescriptionMinor },
    { id: '2.0.0', changes: entryDescriptionMajor },
  ]
  const output = () => input.forEach(validateEntry('error', 'true'))

  expect(output).not.toThrow()
})

test('throw error on error', () => {
  const input = [
    { id: '1.0.0', changes: entryDescriptionMajor },
    { id: '1.0.1', changes: entryDescriptionPatch },
    { id: 'a.b.c', changes: entryDescriptionMinor },
    { id: '2.0.0', changes: entryDescriptionMajor },
  ]
  const output = () => input.forEach(validateEntry('error', 'true'))

  expect(output).toThrow()
})

test('not throw error on error [warn]', () => {
  const input = [
    { id: '1.0.0', changes: entryDescriptionMajor },
    { id: '1.0.1', changes: entryDescriptionPatch },
    { id: 'a.b.c', changes: entryDescriptionMinor },
    { id: '2.0.0', changes: entryDescriptionMajor },
  ]
  const output = () => input.forEach(validateEntry('warn', 'true'))

  expect(output).not.toThrow()
})

test('validate multiple versions', () => {
  const input = [
    { id: '1.0.0', changes: entryDescriptionMajor },
    { id: '1.0.1', changes: entryDescriptionPatch },
    { id: '1.1.0', changes: entryDescriptionMinor },
    { id: '2.0.0', changes: entryDescriptionMajor },
  ]
  const output = () => input.forEach(validateEntry('error', null))

  expect(output).not.toThrow()
})

test('throw error on error', () => {
  const input = [
    { id: '1.0.0', changes: entryDescriptionMajor },
    { id: '1.0.1', changes: entryDescriptionPatch },
    { id: 'a.b.c', changes: entryDescriptionMinor },
    { id: '2.0.0', changes: entryDescriptionMajor },
  ]
  const output = () => input.forEach(validateEntry('error', null))

  expect(output).toThrow()
})

test('not throw error on error [warn]', () => {
  const input = [
    { id: '1.0.0', changes: entryDescriptionMajor },
    { id: '1.0.1', changes: entryDescriptionPatch },
    { id: 'a.b.c', changes: entryDescriptionMinor },
    { id: '2.0.0', changes: entryDescriptionMajor },
  ]
  const output = () => input.forEach(validateEntry('warn', null))

  expect(output).not.toThrow()
})

test('throw error on allowed sections error', () => {
  const input = [
    { id: '1.0.0-beta.0', changes: entryDescriptionMajor },
    { id: '1.0.0-beta.1', changes: entryDescriptionMajor },
  ]
  const output = () => input.forEach(validateEntry('error', 'true'))

  expect(output).toThrow()
})

test('not throw error on allowed sections validation disabled', () => {
  const input = [
    { id: '1.0.0-beta.0', changes: entryDescriptionMajor },
    { id: '1.0.0-beta.1', changes: entryDescriptionMajor },
  ]
  const output = () => input.forEach(validateEntry('error', null))

  expect(output).not.toThrow()
})