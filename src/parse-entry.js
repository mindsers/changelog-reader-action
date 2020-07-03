exports.parseEntry = entry => {
  const [title, ...other] = entry
    .trim()
    .split('\n')

  const [versionPart, versionDate] = title.split(' - ')
  const [versionNumber] = versionPart.match(/[a-zA-ZZ0-9.\-+]+/)

  return {
    id: versionNumber.replace(/(\s)/g, ''),
    date: versionDate,
    text: other
      .filter(item => !/\[.*\]: http/.test(item))
      .join('\n')
  }
}
