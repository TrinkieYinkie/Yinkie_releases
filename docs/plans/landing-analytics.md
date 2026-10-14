# Landing analytics implementation plan

## Scope and behavior
Add anonymous landing-only measurement: one page view per displayed page load,
download intent, and outbound handoff to the official GitHub releases page.
Attribution is captured once from closed source/UTM categories and attached to
all events. The current page has no direct installer links, so an outbound click
must never be reported as a completed download or installation.

The user selected general visit counts without a persistent visitor ID. Use only
in-memory page-view and event UUIDs; no cookies, local/session storage, fingerprint,
installation identity, deletion secret, or cross-product linking. Respect browser
DNT/GPC. Counts describe observed page loads, not unique people.

## Implementation stages (one bounded feature on the existing task branch)
1. Add an isolated dependency-free client, explicit release configuration, exact
   event catalog, safe attribution, and a separate landing ingestion contract.
2. Mark only existing download links, add EN/RU/ES statistics disclosure, and
   extend the existing public-file allowlist and bounded verification runner.
3. Verify behavior/failure cases, rebuild dist, review the diff, commit only task
   files, audit owned processes/locks, and send an informational handoff to the
   requested Telemetry chat. No backend work, publication, push, or main merge.

## Risks and edge cases
Disabled collection must produce no identity, listener, timer or request. Only
production yinkie.com may send to the exact telemetry endpoint. Keep production
collection disabled until the new backend contract is available. Unknown UTM
values collapse to categories; raw URLs, referrers, query strings and link text
never leave the page, including via the request Referer or credentials. Clicks
must retain native navigation, keyboard/modifier/middle-button behavior. Handle
storage restrictions, absent browser APIs, hidden/prerendered pages, BFCache,
duplicate initialization, cancelled/synthetic clicks, request errors/timeouts,
rate limits, bounded retries, batching and navigation during an in-flight view.
Never count landing events as editor activity, installations or retention.

## Verification and done
Use the existing exclusive-lock lifecycle owner with sequential shell:false
children, deadlines, heartbeats and exact cleanup. Add focused behavioral tests
for payload boundaries, attribution, event mapping, navigation-safe delivery,
limits and failure handling. Run the bounded build, inspect the actual browser
with collection disabled, verify source/dist parity, then review final changes.
Done means a tested committed landing client, documented versioned backend
requirements/fixture, preserved pre-existing sample edit, no owned process/lock,
and the requested informational handoff without instructing backend work.

## Verification result (2026-10-14)
The client and integration are complete. The bounded build passed all 12 stages,
including focused behavior tests and byte-identical verification of 14 public files.
Behavior tests cover enabled-mode payloads and fake transport failures; they do not
claim compatibility with an implemented receiver, which is still pending.
Real-browser checks covered the unchanged hero anchor navigation, four instrumented
links, script loading, EN/RU/ES disclosure, light desktop and dark 320 px layout;
no console errors or horizontal page overflow were observed. Disabled-mode tests
prove no identity, listeners, timers or requests. Collection remains disabled.
The backend handoff is docs/landing-analytics.md plus its versioned JSON fixture.
