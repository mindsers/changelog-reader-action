const core = require('@actions/core')

const { hasChronologicalOrder } = require('./rules/has-chronological-order')
const { hasCorrectSections } = require('./rules/has-correct-sections')
const { hasSections } = require('./rules/has-sections')
const { isSemVer } = require('./rules/is-semver')

exports.validateEntry = validationLevel => (entry, index, entries) => {
  if (entry.status == 'unreleased') return // no validation on unreleased versions

  const errors = {
    ...isSemVer(entry),
    ...hasChronologicalOrder(entries, index),
    ...hasSections(entry),
    ...hasCorrectSections(entries, index),
  }

  const log = validationLevel === 'error' ? core.error : core.warning

  if (errors['is-semver']) {
    log(`${entry.id} is not a valid semantic version.`)
  }

  if (errors['has-chronological-order']) {
    const { current, previous } = errors['has-chronological-order']

    log(`Changelog versions out of order. Version ${current} cannot come after ${previous}.`)
  }

  if (errors['has-section']) {
    const { type, entryID } = errors['has-section']

    log(
      `The '${type}' section under version ${entryID} does not contain any listed changes under the heading.`
    )
  }

  if (errors['has-correct-sections']) {
    const { entryID, types } = errors['has-correct-sections']

    log(
      `Only '${types.join(', ')}' section${
        types.length == 1 ? '' : 's'
      } are allowed for version ${entryID}.`
    )
  }

  if (Object.keys(errors).length > 0 && validationLevel === 'error') {
    throw new Error(`${entry.id} entry is invalid.`)
  }
}
