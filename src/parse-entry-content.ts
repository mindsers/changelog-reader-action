import type { Section } from './types.js'

export function parseEntryContent(text: string): Section[] {
  return text
    .split(/^###\s*/gm)
    .filter((content) => content.replace(/\s+/g, '') !== '')
    .map((content) => {
      const [type = '', ...items] = content.trim().split(/\r*\n/)

      return { type: type.toLowerCase().trim(), items }
    })
}
