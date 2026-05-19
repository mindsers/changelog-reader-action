import { parseEntryContent } from './parse-entry-content.js'

describe('parseEntryContent', () => {
  test('parses a single section with one item', () => {
    const input = `### Added\n- foo`

    expect(parseEntryContent(input)).toEqual([{ type: 'added', items: ['- foo'] }])
  })

  test('parses multiple sections', () => {
    const input = [
      '### Added',
      '- new feature',
      '',
      '### Fixed',
      '- a bug',
      '- another bug',
      '',
      '### Changed',
      '- behavior',
    ].join('\n')

    expect(parseEntryContent(input)).toEqual([
      { type: 'added', items: ['- new feature'] },
      { type: 'fixed', items: ['- a bug', '- another bug'] },
      { type: 'changed', items: ['- behavior'] },
    ])
  })

  test('returns an empty array for empty input', () => {
    expect(parseEntryContent('')).toEqual([])
  })

  test('returns an empty array for whitespace-only input', () => {
    expect(parseEntryContent('   \n\n  \n')).toEqual([])
  })

  test('keeps a section with no items', () => {
    expect(parseEntryContent('### Added')).toEqual([{ type: 'added', items: [] }])
  })

  test('lowercases the section type', () => {
    expect(parseEntryContent('### ADDED\n- foo')).toEqual([{ type: 'added', items: ['- foo'] }])
  })

  test('handles mixed-case section types', () => {
    expect(parseEntryContent('### Security\n- patch CVE-2026-XXXX')).toEqual([
      { type: 'security', items: ['- patch CVE-2026-XXXX'] },
    ])
  })

  test('trims trailing whitespace from the section header line', () => {
    expect(parseEntryContent('### Added   \n- foo')).toEqual([{ type: 'added', items: ['- foo'] }])
  })

  test('handles CRLF line endings', () => {
    expect(parseEntryContent('### Added\r\n- foo\r\n- bar')).toEqual([
      { type: 'added', items: ['- foo', '- bar'] },
    ])
  })

  test('treats text before the first ### header as a section of its own', () => {
    // Documents current behavior: parseEntryContent splits on /^###\s*/gm
    // without anchoring on a leading match, so any preamble becomes a
    // pseudo-section with the preamble as its `type`. Locking this in
    // before the TS migration so a different transpiler can't silently
    // shift the split semantics.
    const result = parseEntryContent('Some intro text\n### Added\n- foo')

    expect(result).toHaveLength(2)
    expect(result[1]).toEqual({ type: 'added', items: ['- foo'] })
  })
})
