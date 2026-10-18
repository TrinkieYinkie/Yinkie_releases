// Release configuration: explicit visitor consent and exact production origin remain mandatory.
// Publish only together with a verified, enabled v2 receiver; see docs/release-readiness.md.
export const landingAnalyticsConfig = Object.freeze({
  "enabled": true,
  "siteVersion": "1.1.0",
  "origin": "https://yinkie.com",
  "endpoint": "https://telemetry.yinkie.com/api/telemetry/landing/events",
  "preferenceKey": "yinkie.websiteStatistics",
  "releaseRepository": "TrinkieYinkie/Yinkie_releases",
  "downloadSection": "#platforms",
  "supportEmail": "support@yinkie.com",
  "webOrigin": "https://yinkie.app"
})
