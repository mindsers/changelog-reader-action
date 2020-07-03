const capturingVersionAndDateRegex = /\[?(v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?|unreleased)\]?(\s+-\s+)?(.*)$/i

exports.parseEntry = entry => {
  const [title, ...other] = entry
    .trim()
    .split('\n')

  const [, versionNumber, ...lastCaptureGroup] = title.match(capturingVersionAndDateRegex)
  const [versionDate] = lastCaptureGroup.reverse()

  return {
    id: versionNumber.replace(/(\s)/g, ''),
    date: versionDate,
    text: other
      .filter(item => !/\[.*\]: http/.test(item))
      .join('\n')
  }
}
