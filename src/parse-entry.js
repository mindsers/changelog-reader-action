exports.parseEntry = entry => {
  const [title, ...other] = entry
    .trim()
    .split('\n')

  const [versionPart, datePart] = title.split(' - ')
  const [versionNumber] = versionPart.match(/[a-zA-Z0-9.\-+]+/)
  const [versionDate] = datePart != null && datePart.match(/[0-9-]+/) || []

  return {
    id: versionNumber,
    date: versionDate,
    text: other
      .filter(item => !/\[.*\]: http/.test(item))
      .join('\n')
  }
}
