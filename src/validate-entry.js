const core = require('@actions/core')

const { hasChronologicalOrder } = require('./rules/has-chronological-order')
const { hasCorrectSections } = require('./rules/has-correct-sections')
const { hasSections } = require('./rules/has-sections')
const { isSemVer } = require('./rules/is-semver')

exports.validateEntry = (validationLevel, validateAllowedSections) => (entry, index, entries) => {
  if (entry.status == 'unreleased') return // no validation on unreleased versions

  const validationResults = {
    ...isSemVer(entry),
    ...hasChronologicalOrder(entries, index),
    ...hasSections(entry),
    ...(validateAllowedSections === 'true' ? hasCorrectSections(entries, index) : {}),
  }

  const errors = Object.keys(validationResults)
    .filter(key => validationResults[key] != false)
    .map(key => {
      if (key === 'is-semver') {
        return new Error(`${entry.id} is not a valid semantic version.`)
      }

      if (key === 'has-chronological-order') {
        const { current, previous } = validationResults[key]

        return new Error(
          `Changelog versions out of order. Version ${current} cannot come after ${previous}.`
        )
      }

      if (key === 'has-section') {
        const { type, entryID } = validationResults[key]

        return new Error(
          `The '${type}' section under version ${entryID} does not contain any listed changes under the heading.`
        )
      }

      if (key === 'has-correct-sections') {
        const { entryID, types } = validationResults[key]

        return new Error(
          `Only '${types.join(', ')}' section${
            types.length == 1 ? '' : 's'
          } are allowed for version ${entryID}.`
        )
      }
    })

  const shouldBreakTheBuild = validationLevel === 'error'
  const log = shouldBreakTheBuild ? core.error : core.warning
  for (const error of errors) {
    log(error)
  }

  if (errors.length > 0 && shouldBreakTheBuild) {
    throw new AggregateError(errors, `${entry.id} entry is invalid.`)
  }
}
