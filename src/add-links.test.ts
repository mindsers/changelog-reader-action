import { makeEntry } from './__fixtures__/entry.js'
import { buildLinkRegistry, resolveLinks } from './add-links.js'

const LINKS = [
  `[1.1.2+meta]: https://github.com/olivierlacan/keep-a-changelog/compare/v1.1.1-rc.1+build.123...1.1.2+meta`,
  `[1.1.1-rc.1+build.123]: https://github.com/mindsers/changelog-reader-action/compare/v1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay...v1.1.1-rc.1+build.123`,
  `[1.1.1-DEV-SNAPSHOT]: https://github.com/mindsers/changelog-reader-action/compare/v1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay...v1.1.1-DEV-SNAPSHOT`,
  `[1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay]: https://github.com/mindsers/changelog-reader-action/releases/tag/v1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay`,
  `[github]: https://github.com/mindsers/changelog-reader-action/releases/tag/v1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay`,
]

const body = `### Added
- CHANGELOG can be parsed by the [github][] action
- [1.1.1-DEV-SNAPSHOT][] can be parsed by the github action`

test('resolves and appends link definitions matching referenced placeholders', () => {
  const registry = buildLinkRegistry(LINKS)
  const entry = makeEntry('1.0.0', body, {
    references: ['github', '1.1.1-dev-snapshot'],
  })

  const output = resolveLinks(registry)(entry)

  expect(output.text).toContain('[github]: https://github.com/mindsers/changelog-reader-action')
  expect(output.text).toContain(
    '[1.1.1-DEV-SNAPSHOT]: https://github.com/mindsers/changelog-reader-action/compare'
  )
  expect(output.text.startsWith(body)).toBe(true)
})

test('returns the entry unchanged when there are no references', () => {
  const registry = buildLinkRegistry(LINKS)
  const entry = makeEntry('1.0.0', '### Added\n  - CHANGELOG can be parsed by the github action')

  const output = resolveLinks(registry)(entry)

  expect(output.text).toEqual(entry.body)
  expect(output).toEqual(entry)
})

test('ignores references that the registry does not contain', () => {
  const registry = buildLinkRegistry(LINKS)
  const entry = makeEntry('1.0.0', '### Added\n- See [missing][] for details', {
    references: ['missing'],
  })

  const output = resolveLinks(registry)(entry)

  expect(output.text).toEqual(entry.body)
})

test('preserves the order of references as listed on the entry', () => {
  const registry = buildLinkRegistry(LINKS)
  const entry = makeEntry('1.0.0', body, {
    references: ['1.1.1-dev-snapshot', 'github'],
  })

  const output = resolveLinks(registry)(entry)
  const tail = output.text.slice(entry.body.length).trim().split('\n')

  expect(tail[0]).toContain('[1.1.1-DEV-SNAPSHOT]')
  expect(tail[1]).toContain('[github]')
})
