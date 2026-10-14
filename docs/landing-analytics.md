# Anonymous landing analytics

## Status and boundaries

The landing client is implemented; `analytics-config.js` deliberately ships with
`enabled: false`. It must not send to the existing installation-based endpoint.
The dedicated receiver described below, its CORS policy and separate landing
reports are backend follow-up work. This change does not publish or activate them.

The user chose general visit measurement without a persistent visitor ID. The
client uses no analytics cookies, localStorage, sessionStorage, IndexedDB,
installation ID, deletion secret, fingerprint or cross-product identity. Language
and theme storage in app.js remains separate and is not read by analytics.

One random `pageViewId` lives only in memory for a displayed document. A reload
creates another ID; BFCache restoration, hash navigation, language and theme
changes do not count another view. A background/prerendered page is counted only
when first displayed. DNT=1 or GPC=true suppresses collection. No consent-based
persistent browser identity is introduced.

These are observed page loads, not unique people or persistent sessions. Browser
privacy signals, blockers, JavaScript being disabled, unviewed background pages,
offline operation and bounded best-effort delivery cause undercounting. The IDs
must not be joined with editor identities, account data, network identifiers or
the separately measured download events. A click never proves a completed page
navigation, file download or installation.

## Events and DOM ownership

| Event, version 1 | Trigger | Exact properties |
| --- | --- | --- |
| `landing_page_viewed` | First displayed page load | `{}` |
| `landing_download_clicked` | Any reviewed Desktop/download CTA activation | `placement`: `hero`, `platforms`, `final`, `footer` |
| `landing_download_outbound_clicked` | Activation of the official GitHub Releases link | `placement`: `platforms`, `final`, `footer`; `destination`: `github_releases` |

The hero CTA goes to `#platforms` and produces intent only. The platform card,
final CTA and footer Releases link each produce intent plus outbound in one
logical action. Clicking nested text/icons, keyboard activation, modified clicks
and middle-button activation are supported; prevented, synthetic and right clicks
are ignored. Navigation is never cancelled or delayed. Other links, including Web,
support, repository and navigation links, are outside this version's scope.

Markers are explicit `data-analytics-download` and `data-analytics-placement`
attributes. The client also checks the exact destination and allowed placement.
There are no direct installer links on the current page. Introducing them needs
an explicit catalog/client update, not a fabricated installer event. Download
counts remain owned by the existing independent download measurement system.

## Version 1 receiver contract

Proposed exact endpoint:
`POST https://telemetry.yinkie.com/api/telemetry/landing/events`

This is a distinct protocol from `/api/telemetry/events`. Resolve the product from
the server's hostname binding. Do not weaken or reinterpret the existing editor
contract or fabricate installation IDs/deletion secrets for landing traffic.

The body is UTF-8 JSON sent as `text/plain;charset=UTF-8`, allowing navigation-safe
cross-origin requests without a preflight. The browser sends `credentials: omit`,
`referrerPolicy: no-referrer`, `redirect: error`, `cache: no-store`, `keepalive: true`.
Do not substitute sendBeacon: its credential behavior would break this contract.

Root keys are exactly `schemaVersion: 1`, `contractVersion: 1`, `events` (1–8 items).
Each event has exactly:

- `eventId`: random UUID v4; unchanged across retries, used for deduplication.
- `eventName`, `eventVersion: 1`: one of the three catalog entries above.
- `pageViewId`: random UUID v4, one page instance only, never persisted.
- `sequence`: integer 1–32 for ordering inside that page (requests may arrive out of order).
- `siteVersion`: semver-like three numeric components, currently `1.0.0`.
- `page`: `home`; `locale`: `en`, `ru` or `es` at event time.
- `occurredAt`: ISO UTC timestamp; keep server receipt time separately.
- `attribution`: exact closed object below, frozen for that page instance.
- `properties`: exact event-specific object above; no arbitrary metadata.

Executable example: [analytics-contract-v1.json](analytics-contract-v1.json).
All events in a client batch share one pageViewId. Client batches are well below
16 KiB; the server should enforce a 16 KiB body limit before decoding, exact keys,
allowed value combinations, UUID/timestamp validation and event-ID idempotency.
Return 202/204 or another 2xx only when accepted. Deduplicate repeats safely,
including concurrent retry attempts. Reject invalid batches atomically with 4xx;
apply rate limits and support 429 with numeric Retry-After seconds.

## Attribution catalog

Source/UTM is context on every event, not a fourth event that inflates visits.
Only these values leave the page:

| Field | Allowed values |
| --- | --- |
| `source` | `direct`, `search`, `social`, `ai`, `github`, `email`, `internal`, `campaign`, `referral` |
| `utmSource` | `none`, `other`, `google`, `bing`, `yandex`, `duckduckgo`, `github`, `telegram`, `reddit`, `youtube`, `x`, `linkedin`, `facebook`, `instagram`, `chatgpt`, `claude`, `perplexity`, `newsletter` |
| `utmMedium` | `none`, `other`, `organic`, `cpc`, `paid_social`, `social`, `email`, `referral`, `partner` |
| `utmCampaign` | `none`, `other`, `launch` |

Missing parameters become `none`; empty, duplicate and unknown values become
`other`. A single value is trimmed/lowercased before allowlist matching. Unknown
campaigns are deliberately not sent verbatim; add reviewed campaign codes to the
client and receiver together. Initial public campaign example:
`https://yinkie.com/?utm_source=github&utm_medium=referral&utm_campaign=launch`.

If any recognized UTM parameter is present, it takes attribution precedence:
known sources map to their category, newsletter/email medium maps to email, and
otherwise source is campaign. Without UTM the client categorizes only known
referrer hostnames (with safe subdomain boundaries) into search/social/AI/GitHub/
internal; another host is referral. No referrer is direct (which also includes
referrers hidden by the browser). Google country domains not in the catalog are
referral until reviewed. Full referrers, paths, arbitrary UTM values, utm_term,
utm_content, query strings, link text, hashes, emails and client platform/UA are
never included. An outbound HTTP Referer is also suppressed.

## Delivery and reporting requirements

There are at most 32 produced events per page and 8 events per batch. Click pairs
are accepted or dropped together. Two in-flight slots let an outbound click be
sent even while the initial page-view request is pending. Requests have a five
second timeout. Network errors, 408, 429 and 5xx retry at most three attempts with
the same event IDs. Other HTTP errors are terminal. Retry delays are bounded;
long Retry-After instructions are respected by dropping instead of retrying early.
No offline queue or diagnostics payload is persisted. Page departure starts
eligible queued requests but does not begin further retry loops. Loss at navigation
is possible; no delivery or exactly-once guarantee is implied.

The receiver must permit exact origin `https://yinkie.com`, POST and the stated
content type, without credentials or wildcard origins. Expose Retry-After through
Access-Control-Expose-Headers so the client can honor rate-limit delays. Return CORS headers also
on error/rate-limit responses so errors are not mistaken for generic network
failures. Production DNS/TLS and endpoint deployment remain separate work. The
client refuses localhost, preview hosts, other origins/paths and altered endpoints.
The public client carries no secret; CORS is not authentication or bot prevention.
Handle abuse/rate limits on the server and never persist raw IP, User-Agent,
cookies, Referer or bodies in analytics/access/error logs. Network metadata is
necessarily visible transiently to the receiving service, not part of this schema.

Keep landing events out of editor activity, installations, DAU/MAU and retention.
Report distinct pageViewId with a page-view event as observed visits; distinct
pageViewId with intent as interested visits; distinct pageViewId with outbound as
outbound visits. Use sequence to order same-page funnels and tolerate out-of-order
arrival; do not infer a page view from a click whose view was lost. Show raw click
counts separately from distinct visit counts. Break down by attribution, locale,
site version and placement. Do not label pageViewId as a person or an installation.

Backend retention for raw landing events and their short-lived linking IDs must
be explicitly bounded; recommended maximum is the existing product limit of 90
days, then non-identifying aggregates only. There is no durable client identity
or deletion capability in this protocol; a persistent-identity/deletion feature
would require a new reviewed contract, not silent reuse of editor identities.

## Activation checklist

1. Implement the separate receiver/schema, retention, deduplication, CORS and reports.
2. Run the supplied fixture and negative cases against it, including forbidden
   unknown keys/values and unsupported event/property combinations.
3. Verify TLS, accepted and rejected requests, rate limits and no request logging
   of raw network metadata or bodies. Keep download reporting separate.
4. Enable the committed client configuration only after that readiness check,
   rebuild via `node scripts/lifecycle.mjs build`, then deploy through separately
   authorized publishing. There is no URL/query/local-storage activation bypass.

Local checks run through the existing lifecycle owner. `analytics-test` covers
gates, no-storage identity, attribution, real click mappings, duplicate loads,
BFCache, prerendering, navigation, retry identity and resource bounds. Browser QA
of the shipped configuration must show no telemetry requests while disabled.
