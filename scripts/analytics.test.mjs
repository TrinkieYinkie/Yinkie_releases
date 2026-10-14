import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const code = await readFile(new URL('../analytics.js', import.meta.url), 'utf8');
const configuration = await readFile(new URL('../analytics-config.js', import.meta.url), 'utf8');
const fixture = JSON.parse(await readFile(new URL('../docs/analytics-contract-v1.json', import.meta.url), 'utf8'));
const endpoint = 'https://telemetry.yinkie.com/api/telemetry/landing/events';
let uuidSerial = 0;

function harness(options = {}) {
  let now = Date.parse('2026-10-14T12:00:00Z');
  let timerSerial = 0;
  let randomCalls = 0;
  const timers = new Map();
  const listeners = new Map();
  const requests = [];
  const pending = [];
  const on = (type, callback) => {
    const callbacks = listeners.get(type) || [];
    callbacks.push(callback);
    listeners.set(type, callbacks);
  };
  const document = {
    visibilityState: options.hidden ? 'hidden' : 'visible',
    prerendering: options.prerendering || false,
    documentElement: { lang: options.locale || 'ru' },
    referrer: options.referrer || '', addEventListener: on,
  };
  Object.defineProperty(document, 'cookie', { get() { throw new Error('No cookies'); } });
  class Clock extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const sandbox = {
    YinkieAnalyticsConfig: { enabled: true, endpoint, siteVersion: '1.0.0', ...options.config },
    document, location: {
      origin: options.origin || 'https://yinkie.com', pathname: options.pathname || '/',
      search: options.search || '',
    },
    navigator: { ...options.navigator }, doNotTrack: options.doNotTrack,
    crypto: { randomUUID() { randomCalls++; return '00000000-0000-4000-8000-' + String(++uuidSerial).padStart(12, '0'); } },
    AbortController, URL, URLSearchParams, Date: Clock,
    addEventListener: on,
    setTimeout(callback, delay) { const id = ++timerSerial; timers.set(id, { at: now + delay, callback }); return id; },
    clearTimeout(id) { timers.delete(id); },
    fetch(url, init) {
      requests.push({ url, init, body: JSON.parse(init.body), at: now });
      if (options.pending) return new Promise((resolve, reject) => {
        pending.push({ resolve, reject });
        init.signal.addEventListener('abort', () => reject(new Error('AbortError')), { once: true });
      });
      if (options.networkError) return Promise.reject(new Error('Network unavailable'));
      return Promise.resolve({ status: options.status || 202, headers: { get: () => options.retryAfter ?? null } });
    },
  };
  if (options.noFetch) delete sandbox.fetch;
  if (options.noCrypto) delete sandbox.crypto;
  for (const property of ['localStorage', 'sessionStorage', 'indexedDB']) {
    Object.defineProperty(sandbox, property, { get() { throw new Error('No analytics storage'); } });
  }
  const context = vm.createContext(sandbox);
  const load = () => vm.runInContext(code, context, { timeout: 1000 });
  const fire = (type, event = {}) => { for (const listener of listeners.get(type) || []) listener({ type, ...event }); };
  const settle = async () => { for (let index = 0; index < 8; index++) await Promise.resolve(); };
  const advance = async (milliseconds) => {
    const until = now + milliseconds;
    for (let count = 0; count < 200; count++) {
      await settle();
      const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
      if (!next || next[1].at > until) { now = until; await settle(); return; }
      now = next[1].at;
      timers.delete(next[0]);
      next[1].callback();
    }
    throw new Error('Unbounded timer loop');
  };
  const click = (placement = 'hero', extra = {}) => {
    const destination = placement === 'hero' ? 'section' : 'github_releases';
    const anchor = {
      dataset: { analyticsDownload: destination, analyticsPlacement: placement },
      getAttribute: () => extra.href || (placement === 'hero' ? '#platforms' : 'https://github.com/TrinkieYinkie/Yinkie_releases/releases'),
    };
    fire(extra.type || 'click', {
      isTrusted: true, button: 0, defaultPrevented: false,
      target: { closest: () => anchor },
      preventDefault() { throw new Error('Analytics must not intercept navigation'); },
      stopPropagation() { throw new Error('Analytics must not intercept navigation'); },
      ...extra,
    });
  };
  load();
  return { requests, pending, listeners, timers, document, sandbox, load, fire, click, settle, advance,
    randomCalls: () => randomCalls, events: () => requests.flatMap(request => request.body.events) };
}

function assertEvent(event) {
  assert.deepEqual(Object.keys(event).sort(), Object.keys(fixture.events[0]).sort());
  assert.match(event.eventId, /^[0-9a-f-]{36}$/);
  assert.match(event.pageViewId, /^[0-9a-f-]{36}$/);
  assert.equal(event.eventVersion, 1);
  assert.equal(event.siteVersion, '1.0.0');
  assert.equal(event.page, 'home');
  assert.ok(['en', 'ru', 'es'].includes(event.locale));
  assert.ok(event.sequence >= 1 && event.sequence <= 32);
  assert.deepEqual(Object.keys(event.attribution).sort(), ['source', 'utmCampaign', 'utmMedium', 'utmSource']);
  if (event.eventName === 'landing_page_viewed') assert.deepEqual(event.properties, {});
  else if (event.eventName === 'landing_download_clicked') assert.deepEqual(Object.keys(event.properties), ['placement']);
  else {
    assert.equal(event.eventName, 'landing_download_outbound_clicked');
    assert.deepEqual(Object.keys(event.properties), ['placement', 'destination']);
    assert.equal(event.properties.destination, 'github_releases');
  }
}

export async function runAnalyticsTests() {
  const releaseContext = vm.createContext({});
  vm.runInContext(configuration, releaseContext, { timeout: 1000 });
  assert.equal(typeof releaseContext.YinkieAnalyticsConfig.enabled, 'boolean', 'Activation is an explicit release setting');
  assert.equal(releaseContext.YinkieAnalyticsConfig.endpoint, endpoint);
  for (const options of [
    { config: { enabled: false } }, { config: { endpoint: 'https://wrong.example' } },
    { config: { siteVersion: 'private/path' } }, { origin: 'http://127.0.0.1:4186' },
    { origin: 'https://yinkie.app' }, { pathname: '/unknown' },
    { navigator: { doNotTrack: '1' } }, { doNotTrack: '1' },
    { navigator: { globalPrivacyControl: true } }, { noFetch: true }, { noCrypto: true },
  ]) {
    const h = harness(options);
    assert.equal(h.randomCalls(), 0);
    assert.equal(h.requests.length, 0);
    assert.equal(h.listeners.size, 0);
    assert.equal(h.timers.size, 0);
  }

  const h = harness({ search: '?utm_source=GitHub&utm_medium=referral&utm_campaign=launch' });
  await h.settle();
  h.load();
  h.fire('pageshow', { persisted: true });
  assert.equal(h.events().length, 1, 'One view per page instance including BFCache and duplicate script');
  h.click();
  await h.advance(0);
  h.click('platforms');
  await h.advance(0);
  h.click('final', { ctrlKey: true });
  await h.advance(0);
  h.click('footer', { type: 'auxclick', button: 1 });
  await h.advance(0);
  assert.deepEqual(h.events().map(event => event.eventName), [
    'landing_page_viewed', 'landing_download_clicked',
    'landing_download_clicked', 'landing_download_outbound_clicked',
    'landing_download_clicked', 'landing_download_outbound_clicked',
    'landing_download_clicked', 'landing_download_outbound_clicked',
  ]);
  assert.equal(new Set(h.events().map(event => event.pageViewId)).size, 1);
  assert.equal(new Set(h.events().map(event => event.eventId)).size, 8);
  assert.deepEqual(h.events().map(event => event.sequence), [1, 2, 3, 4, 5, 6, 7, 8]);
  for (const event of h.events()) {
    assertEvent(event);
    assert.deepEqual(event.attribution, { source: 'github', utmSource: 'github', utmMedium: 'referral', utmCampaign: 'launch' });
  }
  for (const request of h.requests) {
    assert.equal(request.url, endpoint);
    assert.equal(request.init.credentials, 'omit');
    assert.equal(request.init.referrerPolicy, 'no-referrer');
    assert.equal(request.init.redirect, 'error');
    assert.equal(request.init.keepalive, true);
    assert.equal(request.init.headers['Content-Type'], 'text/plain;charset=UTF-8');
    assert.deepEqual(Object.keys(request.body), ['schemaVersion', 'contractVersion', 'events']);
    assert.equal(request.body.schemaVersion, 1);
    assert.equal(request.body.contractVersion, 1);
  }
  const beforeIgnored = h.events().length;
  for (const extra of [{ defaultPrevented: true }, { isTrusted: false }, { button: 2 },
    { type: 'auxclick', button: 0 }, { href: 'https://yinkie.app' }, { href: 'https://github.com/evil/releases' }]) h.click('final', extra);
  h.click('unregistered');
  await h.advance(0);
  assert.equal(h.events().length, beforeIgnored);
  h.click('hero', { detail: 0 }); // Native keyboard link activation is a click.
  await h.advance(0);
  assert.equal(h.events().length, beforeIgnored + 1);

  const hidden = harness({ hidden: true });
  assert.equal(hidden.randomCalls(), 0);
  assert.equal(hidden.requests.length, 0);
  hidden.document.visibilityState = 'visible';
  hidden.fire('visibilitychange');
  hidden.fire('visibilitychange');
  assert.equal(hidden.events().length, 1);
  const prerender = harness({ prerendering: true });
  assert.equal(prerender.randomCalls(), 0);
  prerender.document.prerendering = false;
  prerender.fire('prerenderingchange');
  assert.equal(prerender.events().length, 1);
  const reload = harness();
  assert.notEqual(reload.events()[0].pageViewId, h.events()[0].pageViewId);

  for (const [referrer, source] of [
    ['', 'direct'], ['https://www.google.com/search?q=PRIVATE', 'search'],
    ['https://news.yinkie.com/private', 'internal'], ['https://chatgpt.com/c/PRIVATE', 'ai'],
    ['https://github.com/private/repo', 'github'], ['https://t.me/PRIVATE', 'social'],
    ['https://google.com.evil.example/PRIVATE', 'referral'], ['not a URL PRIVATE', 'referral'],
  ]) {
    const check = harness({ referrer });
    assert.equal(check.events()[0].attribution.source, source);
    assert.ok(!JSON.stringify(check.events()).includes('PRIVATE'));
  }
  const privateValues = harness({
    search: '?utm_source=person%40PRIVATE.example&utm_medium=PRIVATE&utm_campaign=PRIVATE&utm_term=PRIVATE&token=PRIVATE',
    referrer: 'https://PRIVATE.example/PRIVATE?secret=PRIVATE',
  });
  assert.deepEqual(privateValues.events()[0].attribution, { source: 'campaign', utmSource: 'other', utmMedium: 'other', utmCampaign: 'other' });
  assert.ok(!JSON.stringify(privateValues.requests).includes('PRIVATE'));
  const duplicates = harness({ search: '?utm_source=github&utm_source=PRIVATE&utm_campaign=' });
  assert.equal(duplicates.events()[0].attribution.utmSource, 'other');
  assert.equal(duplicates.events()[0].attribution.utmCampaign, 'other');
  const email = harness({ search: '?utm_medium=email' });
  assert.equal(email.events()[0].attribution.source, 'email');

  const navigating = harness({ pending: true });
  navigating.click('final');
  assert.equal(navigating.requests.length, 2, 'Outbound request starts while view is still in flight');
  assert.equal(navigating.requests[1].body.events.length, 2);
  navigating.fire('pagehide');
  await navigating.advance(20000);
  assert.equal(navigating.requests.length, 2, 'No retry storm after departing');
  assert.equal(navigating.timers.size, 0);

  for (const options of [{ networkError: true }, { status: 503 }, { status: 429 }, { status: 408 }]) {
    const retrying = harness(options);
    await retrying.advance(60000);
    assert.equal(retrying.requests.length, 3);
    assert.equal(new Set(retrying.events().map(event => event.eventId)).size, 1, 'Retries preserve idempotency');
    assert.equal(retrying.timers.size, 0);
  }
  for (const status of [400, 401, 403, 404, 413, 422]) {
    const rejected = harness({ status });
    await rejected.advance(60000);
    assert.equal(rejected.requests.length, 1, 'Terminal contract errors are not retried');
  }
  const rateLimited = harness({ status: 429, retryAfter: '10' });
  await rateLimited.advance(9999);
  assert.equal(rateLimited.requests.length, 1);
  await rateLimited.advance(1);
  assert.equal(rateLimited.requests.length, 2);
  const longLimit = harness({ status: 429, retryAfter: '60' });
  await longLimit.advance(60000);
  assert.equal(longLimit.requests.length, 1);
  const dateLimit = harness({ status: 429, retryAfter: 'Wed, 14 Oct 2026 13:00:00 GMT' });
  await dateLimit.advance(60000);
  assert.equal(dateLimit.requests.length, 1);
  const timedOut = harness({ pending: true });
  await timedOut.advance(60000);
  assert.equal(timedOut.requests.length, 3);
  assert.ok(timedOut.requests.every(request => request.init.signal.aborted));
  assert.equal(timedOut.timers.size, 0);

  const bounded = harness({ pending: true });
  for (let index = 0; index < 100; index++) bounded.click('final');
  assert.equal(bounded.requests.length, 2, 'At most two in-flight requests');
  for (let index = 0; index < 10; index++) {
    for (const request of bounded.pending) request.resolve({ status: 202 });
    await bounded.advance(0);
  }
  const boundedEvents = bounded.events();
  assert.equal(boundedEvents.length, 31, 'Whole click pairs fit the 32-event page budget');
  assert.ok(bounded.requests.every(request => request.body.events.length <= 8));
  assert.equal(bounded.timers.size, 0);

  for (const event of fixture.events) assertEvent(event);
  console.log('PASS analytics: gates, storage-free identity, attribution privacy, clicks, BFCache, navigation, retry/timeout/queue bounds and wire fixture.');
}
