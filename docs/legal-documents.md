# Yinkie 1.0.0 public documents

The application and landing share Terms v3 and Privacy/data-inventory v2.
Terms v2 remains archived; its text is retained with a link to the current version.
This integration adds them to the static allowlist, footer and sitemap; it does
not publish the site or activate a server collection flag.

The current documents are in English; footer navigation is translated into
English, Russian and Spanish. Canonical URLs are under https://yinkie.com/legal/.
Serve the stylesheet, both Terms versions and both v2 privacy documents together so the policy, terms and data inventory share
their local stylesheet. The documents load no JavaScript or external fonts.

## Verification and release boundary

Run the existing bounded build before merging. It checks local references,
canonical URLs, static-only document markup, exact HTTP routes and byte-identical
dist output. Only allowlisted public assets enter the output. The existing
sample Markdown files and development documentation remain excluded.

Public publication, installed application telemetry acceptance and operational
backup/restore evidence are separate release gates. Merging this preparation
does not assert that those gates passed.

## Historical source hashes before Terms v3 (SHA-256)

- `legal/legal.css`: `ed57329b3b9099826dee8c1dda84fa8d7c55a2cbe6e6fa7ee6cb52a4ea6e382e`.
- `legal/privacy-v2.html`: `f61051b38539085833829a25125e23ad994dee9874b9e71b2a1f684758ccb34c`.
- `legal/terms-v2.html`: `9d4be8e75bc9872d5f511555de5993f1c11b37989d6e99cc7316cbc045d8ca8d`.
- `legal/telemetry-data-v2.html`: `b8614995ba5a6123a5b8ed1516ba5365789a6294ad29ae6c0ffd36a80e63e4ab`.

## October 25 Terms update

Terms v3 covers email-based beta activation, future paid keys, feature availability,
local-file responsibilities, lawful liability limitations and bug-report contacts.
This is a new Terms version, not a change to Privacy v2 consent. Enrollment and
payments are not activated by the copy. Static review only; no legal certification,
application rebuild or publication is claimed. Prior hashes above are historical.
