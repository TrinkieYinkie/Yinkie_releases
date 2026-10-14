// Enable only after the landing v1 receiver, CORS and reports are deployed.
// This public configuration contains no credentials or visitor identity.
globalThis.YinkieAnalyticsConfig = Object.freeze({
  enabled: false,
  siteVersion: '1.0.0',
  endpoint: 'https://telemetry.yinkie.com/api/telemetry/landing/events',
});
