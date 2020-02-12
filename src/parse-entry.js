exports.parseEntry = entry => {
  const [title, ...other] = entry
    .trim()
    .split('\n')

  const [versionNumber, versionDate] = title.replace(/(\[|\])/g, '').split(' - ')

  return {
    id: versionNumber.match(/(\w|\.)/g).join(''),
    date: versionDate,
    text: other
      .filter(item => !/\[.*\]: http/.test(item))
      .join('\n')
  }
}
