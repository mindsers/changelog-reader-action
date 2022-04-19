const core = require('@actions/core')

const linkRegex =
  /^\[.+\]:\s?(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:\/?#[\]@!\$&'\(\)\*\+,;=.]+$/
const avoidNonVersionData = text => linkRegex.test(text)

exports.getLinks = rawData => {
  const content = String(rawData)

  core.debug(`CHANGELOG content: ${content}`)

  return content.trim().split('\n').filter(avoidNonVersionData)
}
