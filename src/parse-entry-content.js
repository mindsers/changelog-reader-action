exports.parseEntryContent = function (text) {
  return text
    .split(/^###\s*/gm)
    .filter(content => content.replace(/\s+/g, '') != '')
    .map(content => {
      const [type, ...items] = content.trim().split(/\r*\n/)

      return { type: type.toLowerCase().trim(), items }
    })
}
