export function addLinks(links: string[]): <T extends { text: string }>(entry: T) => T {
  return (entry) => {
    const { text } = entry
    const linkRegex = /(\[.+\])\[\]/gi

    let tempText = `${text}`
    let match = linkRegex.exec(text)
    while (match != null) {
      const placeholder = match[1]
      const link = links.find(
        (element) => placeholder !== undefined && element.includes(placeholder)
      )
      tempText = `${tempText}\n${link}`
      match = linkRegex.exec(text)
    }

    return { ...entry, text: tempText.trim() }
  }
}
