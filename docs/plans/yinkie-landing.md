# Yinkie landing page

## Outcome and reference
Build a local, standalone static landing page for yinkie.com in this public
distribution repository. WritersStudio is a read-only visual reference:
confident sans-serif headings, coral-backed real app captures, alternating
light and dark sections, progressive feature storytelling, direct product
actions and a clear free/optional-paid boundary. Keep Yinkie's graphite/ember
identity and document-oriented positioning. Do not copy WritersStudio product
claims, project model, cloud promises or personal information.

## Product contract
- yinkie.com is the landing page; yinkie.app is the browser editor.
- support@yinkie.com is the public support address.
- The core application and main functionality remain free on Desktop and Web.
- Optional paid extras may follow. Accounts, synchronization and other online
  services are not currently available; do not rule them out or promise they
  will be free. Do not imply a delivery date or guarantee encryption.
- Plain Markdown, Visual and Source, Source Preview, tables, lists, footnotes,
  tabs and split editing are shared capabilities.
- Named multi-root workspaces, workspace search, native file observation and
  local version history belong to Desktop. Browser persistence varies by browser.
- Mermaid rendering is currently Desktop-only. A sample diagram describing
  synchronization is document content, not evidence of Yinkie synchronization.
- No platform-specific installer or live service availability is established
  by this task. Use the official releases page without invented version badges.
- This repository is public. It does not establish the application's source
  license; avoid extrapolating an application licensing claim.

## Stages
1. Plan on feature/yinkie-landing, then feature/yinkie-landing-foundation:
   public repository instructions, dependency-free bounded lifecycle owner,
   static preview/build/check entry points. Integrate after verification.
2. feature/yinkie-landing-page: complete responsive page, EN/RU/ES content,
   light/dark themes, existing screenshots, honest platform comparison,
   free-core statement, support links and FAQ. Verify and integrate.
3. Review combined changes and record remaining screenshot/launch inputs.

## Visual and content plan
A spacious headline and an ember-backed screenshot introduce the visual
Markdown editor. Continue through portable files, real Desktop workspaces,
safe Source preservation, rich documents, Desktop/Web choice, the free-core
promise and concise FAQ. Use actual captures with accurate captions, without
synthetic app UI or repainted themes. Screenshots are already public demo files.
All imagery, fonts and scripts load locally. No analytics, trackers or forms.

## Edge cases and regressions
- Preserve the pre-existing sample edit exactly and exclude it from commits.
- Never write to the application or WritersStudio reference repositories.
- No publication, push, main merge or repository-hosted automation in this task.
- Page remains usable without JavaScript, local storage, network fonts or API.
- No native select popup; locale choices use one themed inline button group.
- Theme controls and scrollbars share semantic tokens; both themes, reduced
  motion, keyboard focus, narrow/short layouts and enlarged text are covered.
- Prefer responsive cards to an overflowing comparison table.
- Images have accurate dimensions/alt text; do not label diagram as search.
- Do not ship private paths, names, documents, tokens or unreviewed media.

## Verification strategy
Warn before heavy work; this static site requires no install or application build.
Use one fail-fast owner, exclusive lock, sequential shell:false Node children,
per-step deadlines, progress heartbeats, signal cleanup and IPC parent-death
cleanup. Restrict children from creating subprocesses so exact child handles
cover the complete owned tree. Never clear a competing runner's lock.
Validate source syntax, locale parity, assets/anchors, public data boundaries,
HTTP serving and the deterministic public-output allowlist. Build into ignored
dist; do not package samples or internal docs. Inspect the reference appearance;
do not run unrequested browser automation against the new site.
Audit ownership/locks immediately after every commit before any next action.

## Definition of done
Complete local site in the task branch, task changes committed, existing sample
change preserved, bounded validation/build passed, public output excludes
private/development files, no owned processes or locks left behind. Record
limitations honestly: new light-theme, Source+Preview and workspace-search
captures are follow-up inputs; actual domain/release activation is separate.

## Status
Implementation and local build complete. The first viewport and first story
section now prioritize editing AI-assisted Markdown, with multiple Desktop
folders and documents as the connected workflow. All three locales are aligned.
See ../landing-review.md for validation evidence and remaining launch inputs.
