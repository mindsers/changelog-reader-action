const { valid } = require('semver')

exports.isSemVer = function (entry) {
  if (valid(entry.id)) {
    return {}
  }

  return {
    'is-semver': true,
  }
}
