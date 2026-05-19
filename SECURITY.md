# Security policy

## Reporting a vulnerability

If you believe you have found a security vulnerability in _Changelog Reader
Action_, please report it through GitHub's private vulnerability reporting:

> https://github.com/mindsers/changelog-reader-action/security/advisories/new

This goes directly to the maintainers and is not visible to the public. Do
**not** open a regular issue or pull request for security problems — they are
indexed and discoverable immediately.

You should expect an initial acknowledgement within 7 days. The maintainers
will then assess the report, request a CVE if appropriate, and coordinate a
fix and disclosure with you.

## Scope

This policy covers:

- The bundled action entrypoint (`dist/index.js`) and its source under `src/`.
- The action's published metadata (`action.yml`).

Out of scope:

- The content of any consumer project's `CHANGELOG.md` — it is parsed as
  untrusted input, but malicious content there is the consumer's problem to
  triage, not ours.
- The GitHub Actions runner environment, Node.js itself, or any third-party
  action that ours is composed with — report those to their respective
  maintainers.

## Supported versions

| Version | Supported          |
| ------- | ------------------ |
| `v2.x`  | :white_check_mark: |
| `v1.x`  | :x:                |

The latest minor release of the current major version receives security
fixes. Older majors are not maintained.
