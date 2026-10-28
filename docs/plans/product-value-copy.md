# Product value copy — 28 October 2026

## Scope

The maintainer requested concrete product copy, then authorized a commit,
integration into main and push. Explain shipped editing features in EN/RU/ES
through real tasks: visual formatting, ordinary Markdown files, source editing,
local Desktop folders, search, history and customizable keyboard shortcuts.

## Integration

The original copy was prepared on the Desktop Pro launch branch. Public delivery
starts from main and brings over the product-value revision only. The earlier
Pro activation launch commits remain on their separate branch for later release.
The existing public beta/activation terms stay in the future tense, with a
concrete beta-access heading. The new FAQs do not imply Pro activation is live.

The static English HTML, three locale catalogs, metadata and public README use
the same positioning. Compatibility details follow the everyday editing examples.
The AI workflow remains one use case; no integrated generation is promised.

## Risks and boundaries

- Offline editing is a Desktop capability, not an installable offline Web app.
- Windows is available; a macOS build is not available yet.
- Compatibility checks diagnose syntax and do not convert or rewrite text.
- History describes saved versions, not a guarantee that every edit is retained.
- Preserve real screenshots, legal documents, consent copy and CTA destinations.
- Keep unrelated sample changes out of the publication commit.

## Verification and definition of done

The original copy passed the bounded build, 18 analytics suites, exact English
fallback checks and browser review of EN/RU/ES in light/dark at 1280x800, 390x844
and 320x568. Final public integration must pass the bounded build again, preserve
the deferred Pro branch and unrelated sample, merge into main and verify the
remote main commit after push. No hosted workflows or application code change.

Final public integration passed the bounded 33-file build, all 18 analytics suites, HTTP/content/locale checks and exact output comparison. All non-licensing copy matches the reviewed revision, and every static English string matches its locale. The unrelated sample retains its original checksum. Main integration and remote verification are performed after this commit.
