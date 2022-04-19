const core = require('@actions/core')

exports.addLinks = links => entry => {
  const { text } = entry
  const linkRegex = /(\[.+\])\[\]/gi

  let tempText = `${text}`
  while (true) {
    const results = linkRegex.exec(text)

    if (results == null) {
      break
    }

    const link = links.find(element => element.includes(results[1]))

    tempText = tempText + '\n' + link
  }

  return { ...entry, text: tempText.trim() }
}
