const { hasCorrectSections } = require('./has-correct-sections')

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

test('should not throw error', () => {
  const outputError = () =>
    hasCorrectSections(
      [
        { id: '1.0.0', changes: entryDescriptionMajor },
        { id: '1.0.1', changes: entryDescriptionMajor },
      ],
      1
    )
  const output = () =>
    hasCorrectSections(
      [
        { id: '1.0.0', changes: entryDescriptionMajor },
        { id: '2.0.0', changes: entryDescriptionMajor },
      ],
      1
    )

  expect(output).not.toThrow()
  expect(outputError).not.toThrow()
})

test('should return error when added section in patch release', () => {
  const output = hasCorrectSections(
    [
      { id: '1.0.0', changes: entryDescriptionMajor },
      { id: '1.0.1', changes: entryDescriptionMajor },
    ],
    1
  )

  expect(output['has-correct-sections']).toBeTruthy()
})

test('should return error when removed section in minor release should throw error', () => {
  const output = hasCorrectSections(
    [
      { id: '1.0.0', changes: entryDescriptionMajor },
      { id: '1.1.0', changes: entryDescriptionMajor },
    ],
    1
  )

  expect(output['has-correct-sections']).toBeTruthy()
})
