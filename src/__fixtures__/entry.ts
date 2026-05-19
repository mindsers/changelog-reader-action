import type { Entry, EntryStatus } from '../types.js'

export function makeEntry(
  id: string,
  body = '',
  options: { status?: EntryStatus; date?: string; references?: string[] } = {}
): Entry {
  return {
    id,
    date: options.date,
    status: options.status ?? 'released',
    body,
    references: options.references ?? [],
    text: body,
  }
}
