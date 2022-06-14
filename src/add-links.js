exports.addLinks = links => entry => {
  const { text } = entry
  const linkRegex = /(\[.+\])\[\]/gi

  let tempText = `${text}`
  let results = null
  while ((results = linkRegex.exec(text)) != null) {
    const link = links.find(element => element.includes(results[1]))
    tempText = `${tempText}\n${link}`
  }

  return { ...entry, text: tempText.trim() }
}
