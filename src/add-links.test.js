const { addLinks } = require("./add-links");

test("retreive add correct links to entry", () => {
  const output = addLinks([
    `[1.1.2+meta]: https://github.com/olivierlacan/keep-a-changelog/compare/v1.1.1-rc.1+build.123...1.1.2+meta`,
    `[1.1.1-rc.1+build.123]: https://github.com/mindsers/changelog-reader-action/compare/v1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay...v1.1.1-rc.1+build.123`,
    `[1.1.1-DEV-SNAPSHOT]: https://github.com/mindsers/changelog-reader-action/compare/v1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay...v1.1.1-DEV-SNAPSHOT`,
    `[1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay]: https://github.com/mindsers/changelog-reader-action/releases/tag/v1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay`,
    `[github]: https://github.com/mindsers/changelog-reader-action/releases/tag/v1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay`,
  ])({
    text: `### Added
  - CHANGELOG can be parsed by the [github][] action
  - [1.1.1-DEV-SNAPSHOT][] can be parsed by the github action`,
  });

  expect(output).toEqual(3);
});

test("add nothing when there is no references", () => {
  const output = addLinks([
    `[1.1.2+meta]: https://github.com/olivierlacan/keep-a-changelog/compare/v1.1.1-rc.1+build.123...1.1.2+meta`,
    `[1.1.1-rc.1+build.123]: https://github.com/mindsers/changelog-reader-action/compare/v1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay...v1.1.1-rc.1+build.123`,
    `[1.1.1-DEV-SNAPSHOT]: https://github.com/mindsers/changelog-reader-action/compare/v1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay...v1.1.1-DEV-SNAPSHOT`,
    `[1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay]: https://github.com/mindsers/changelog-reader-action/releases/tag/v1.0.0-alpha-a.b-c-somethinglong+build.1-aef.1-its-okay`,
  ])({
    text: `### Added
  - CHANGELOG can be parsed by the github action`,
  });

  expect(output.length).toBeLessThan(1);
});
