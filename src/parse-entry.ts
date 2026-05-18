import { prerelease } from 'semver'

import type { Entry, EntryStatus } from './types.js'

export function parseEntry(entry: string): Entry {
  const [title = '', ...other] = entry.trim().split('\n')

  const [versionPart = '', datePart] = title.split(' - ')
  const versionNumber = versionPart.match(/[a-zA-Z0-9.\-+]+/)?.[0] ?? ''
  const versionDate = datePart != null ? datePart.match(/[0-9-]+/)?.[0] : undefined

  return {
    id: versionNumber,
    date: versionDate,
    status: computeStatus(versionNumber, title),
    text: other.filter((item) => !/\[.*\]: http/.test(item)).join('\n'),
  }
}

function computeStatus(version: string, title: string): EntryStatus {
  if (prerelease(version)) {
    return 'prereleased'
  }

  if (/\[yanked\]/i.test(title)) {
    return 'yanked'
  }

  if (/\[unreleased\]/i.test(title)) {
    return 'unreleased'
  }

  return 'released'
}
