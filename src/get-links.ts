const linkRegex =
  /^\[.+\]:\s?(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/
const avoidNonVersionData = (text: string): boolean => linkRegex.test(text)

export function getLinks(rawData: Buffer | string): string[] {
  const content = String(rawData)

  return content.trim().split('\n').filter(avoidNonVersionData)
}
