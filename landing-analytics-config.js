// Public reviewed configuration. Enable only after the shared v2 receiver and release gates are ready.
export const landingAnalyticsConfig = Object.freeze({
  "enabled": false,
  "siteVersion": "1.0.0",
  "origin": "https://yinkie.com",
  "endpoint": "https://telemetry.yinkie.com/api/telemetry/landing/events",
  "preferenceKey": "yinkie.websiteStatistics",
  "releaseRepository": "TrinkieYinkie/Yinkie_releases",
  "downloadSection": "#platforms",
  "supportEmail": "support@yinkie.com",
  "webOrigin": "https://yinkie.app"
})
