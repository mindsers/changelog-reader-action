exports.parseEntry = version => {
  const [title, ...other] = version.split('\n')
  const [versionNumber, versionDate] = title.replace(/(\[|\])/g, '').split(' - ')

  return {
    id: versionNumber,
    date: versionDate,
    text: other
      .filter(item => !/\[.*\]: http/
      .test(item)).join('\n')
  }
}
