# Landing review

## Delivered
- Local static landing for yinkie.com; Web calls to action go to yinkie.app.
- Desktop calls to action use the confirmed origin repository's /releases page.
- Public support is support@yinkie.com.
- AI-assisted Markdown is prominent in the first viewport and the first story
  section: ask for Markdown, open the .md file, revise it and organize context.
- Multiple folders/documents are presented as a Desktop workspace capability.
- Core functionality remains free on Desktop and Web; future extras may be paid.
  Accounts/sync/online services are currently unavailable, without excluding
  their future introduction.
- English, Russian and Spanish; light/dark semantic tokens, system preference,
  local explicit preferences, keyboard-operable buttons and native details.
- Existing captures have accurate captions. Source-fragment and diagram images
  are not labelled as Source Preview or workspace-search screenshots.
- Public build uses an explicit 14-file allowlist and excludes samples, raw
  captures, source repository metadata and development documentation.

## Evidence
The bounded build passed all eight sequential stages: owner/stage/app/locale
syntax, locale parity and content/asset/anchor checks, HTTP allowlist checks,
public build, and byte-for-byte output verification.
The foundation check confirms children cannot spawn subprocesses or workers.
The preview returned HTTP 200 and was offered in the app browser.

The initial non-interactive preview could not receive stdin. Its exact
restricted child was identified by parent PID, creation time and command line,
then stopped. The parent exited and removed its lock; no owned process or lock
remained. Future interactive preview sessions should retain a TTY.

Reference structure and visual direction were studied from its local HTML/CSS,
plan and product assets. Direct browser access to its file URL was blocked by
the browser policy; no workaround was used.
No browser interaction/resizing/screenshot QA is claimed for this new landing.

## Remaining launch inputs
- Current light-theme, workspace and Source + Preview captures; see screenshots.md.
- Actual release assets and domain activation. Do not invent installer names,
  versions, platform support, online services or licensing claims.
- A final real-browser visual/accessibility review before public launch.
- Publishing was not part of this task; there was no push, main merge or workflow change.

## Anonymous analytics follow-up
The client, closed attribution catalog and download-intent/outbound instrumentation
are implemented with no persistent visitor ID. Production sending remains disabled
pending a separate landing receiver in Telemetry. See [the contract](landing-analytics.md)
and [wire fixture](analytics-contract-v1.json). Existing download counts remain separate.

## Wording reference
AI positioning describes an external Markdown workflow and does not claim that
all AI responses use Markdown or that Yinkie provides an integrated AI model.
Anthropic's primary prompting guidance documents control over Markdown output:
https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-templates-and-variables

## Compatibility follow-up
The landing and README list all four shipped compatibility profiles and explain
per-document selection, defaults for new files and diagnostics. Claims were
checked against the current production profile registry, English UI catalog and
delivered compatibility plan, read-only. No automatic conversion, universal
editor support or identical rendering is implied. This section replaces the
generic introduction to prioritize the user-requested distinction.
