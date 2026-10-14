(() => {
  'use strict';

  const config = globalThis.YinkieAnalyticsConfig;
  const endpoint = 'https://telemetry.yinkie.com/api/telemetry/landing/events';
  if (config?.enabled !== true || config.endpoint !== endpoint ||
      !/^\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(config.siteVersion) ||
      location.origin !== 'https://yinkie.com' ||
      !['/', '/index.html'].includes(location.pathname) ||
      navigator.doNotTrack === '1' || globalThis.doNotTrack === '1' ||
      navigator.globalPrivacyControl === true ||
      typeof globalThis.fetch !== 'function' ||
      typeof globalThis.crypto?.randomUUID !== 'function' ||
      typeof globalThis.AbortController !== 'function' ||
      globalThis.__yinkieLandingAnalyticsLoaded) return;
  globalThis.__yinkieLandingAnalyticsLoaded = true;

  const MAX_EVENTS = 32;
  const MAX_BATCH = 8;
  const MAX_IN_FLIGHT = 2;
  const MAX_ATTEMPTS = 3;
  const REQUEST_TIMEOUT = 5000;
  const allowed = {
    utmSource: ['google', 'bing', 'yandex', 'duckduckgo', 'github', 'telegram', 'reddit', 'youtube', 'x', 'linkedin', 'facebook', 'instagram', 'chatgpt', 'claude', 'perplexity', 'newsletter'],
    utmMedium: ['organic', 'cpc', 'paid_social', 'social', 'email', 'referral', 'partner'],
    utmCampaign: ['launch'],
  };
  const groups = {
    search: ['google', 'bing', 'yandex', 'duckduckgo'],
    social: ['telegram', 'reddit', 'youtube', 'x', 'linkedin', 'facebook', 'instagram'],
    ai: ['chatgpt', 'claude', 'perplexity'],
  };
  const referrers = {
    search: ['google.com', 'bing.com', 'yandex.ru', 'yandex.com', 'duckduckgo.com'],
    social: ['t.me', 'telegram.org', 'reddit.com', 'youtube.com', 'youtu.be', 'x.com', 'twitter.com', 'linkedin.com', 'facebook.com', 'instagram.com'],
    ai: ['chatgpt.com', 'chat.openai.com', 'claude.ai', 'perplexity.ai'],
    github: ['github.com'],
    internal: ['yinkie.com', 'yinkie.app'],
  };

  // Read attribution only when a page is actually displayed. No raw value is
  // retained in an event, queue, request URL, request Referer, or diagnostics.
  function attribution() {
    const params = new URLSearchParams(location.search);
    const result = {};
    for (const [key, query] of [['utmSource', 'utm_source'], ['utmMedium', 'utm_medium'], ['utmCampaign', 'utm_campaign']]) {
      const values = params.getAll(query);
      const value = values.length === 1 ? values[0].toLowerCase().trim() : '';
      result[key] = values.length === 0 ? 'none' : allowed[key].includes(value) ? value : 'other';
    }
    let source = 'direct';
    if (Object.values(result).some(value => value !== 'none')) {
      source = result.utmSource === 'github' ? 'github' :
        result.utmSource === 'newsletter' || result.utmMedium === 'email' ? 'email' :
        Object.keys(groups).find(group => groups[group].includes(result.utmSource)) || 'campaign';
    } else if (document.referrer) {
      source = 'referral';
      try {
        const referrer = new URL(document.referrer);
        if (['https:', 'http:'].includes(referrer.protocol)) {
          source = Object.keys(referrers).find(group => referrers[group].some(domain =>
            referrer.hostname === domain || referrer.hostname.endsWith('.' + domain))) || 'referral';
        }
      } catch { /* An invalid referrer is only an unknown referral. */ }
    }
    return Object.freeze({ source, ...result });
  }

  let pageViewId;
  let acquisition;
  let produced = 0;
  let sequence = 0;
  let inFlight = 0;
  let queue = [];
  let wake;
  let started = false;
  let stopped = false;
  let departing = false;

  function locale() {
    return ['en', 'ru', 'es'].includes(document.documentElement.lang) ? document.documentElement.lang : 'en';
  }

  function collect(definitions) {
    if (stopped || !started || produced + definitions.length > MAX_EVENTS) return;
    try {
      // Construct the whole logical action before adding any events to the queue.
      const items = definitions.map(([eventName, properties]) => ({
        event: {
          eventId: crypto.randomUUID(), eventName, eventVersion: 1,
          pageViewId, sequence: ++sequence, siteVersion: config.siteVersion,
          page: 'home', locale: locale(), occurredAt: new Date().toISOString(),
          attribution: acquisition, properties,
        },
        attempts: 0, readyAt: 0,
      }));
      produced += items.length;
      queue.push(...items);
    } catch {
      stopped = true;
      queue = [];
    }
  }

  function schedule() {
    clearTimeout(wake);
    if (stopped || departing || !queue.length || inFlight >= MAX_IN_FLIGHT) return;
    const delay = Math.max(0, Math.min(...queue.map(item => item.readyAt)) - Date.now());
    wake = setTimeout(flush, delay);
  }

  function retryDelay(response, attempts) {
    const raw = response?.headers?.get('Retry-After');
    // Unsupported date-valued instructions are also honored by not retrying.
    if (raw && !/^\d+$/.test(raw)) return null;
    const seconds = raw && /^\d+$/.test(raw) ? Number(raw) : NaN;
    // Do not retry earlier than a server's longer rate-limit request.
    if (Number.isFinite(seconds) && seconds > 30) return null;
    return Number.isFinite(seconds) ? Math.max(1000, seconds * 1000) : attempts * 1000;
  }

  async function deliver(batch) {
    inFlight++;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    let response;
    let retry = false;
    for (const item of batch) item.attempts++;
    try {
      response = await fetch(endpoint, {
        method: 'POST', mode: 'cors', credentials: 'omit', redirect: 'error',
        referrerPolicy: 'no-referrer', cache: 'no-store', keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify({ schemaVersion: 1, contractVersion: 1, events: batch.map(item => item.event) }),
        signal: controller.signal,
      });
      retry = response.status === 408 || response.status === 429 || response.status >= 500;
    } catch { retry = true; }
    finally {
      clearTimeout(timeout);
      inFlight--;
    }
    if (retry && !departing && !stopped) {
      const delay = retryDelay(response, Math.max(...batch.map(item => item.attempts)));
      if (delay !== null) {
        for (const item of batch) {
          if (item.attempts < MAX_ATTEMPTS) queue.push({ ...item, readyAt: Date.now() + delay });
        }
      }
    }
    schedule();
  }

  function flush() {
    clearTimeout(wake);
    if (stopped) return;
    while (inFlight < MAX_IN_FLIGHT) {
      const batch = queue.filter(item => item.readyAt <= Date.now()).slice(0, MAX_BATCH);
      if (!batch.length) break;
      const selected = new Set(batch);
      queue = queue.filter(item => !selected.has(item));
      // A second bounded slot lets an outbound click leave while the initial
      // page view request is still in flight. Navigation is never intercepted.
      void deliver(batch);
    }
    schedule();
  }

  function start() {
    if (started || stopped || document.visibilityState !== 'visible' || document.prerendering) return;
    try {
      pageViewId = crypto.randomUUID();
      acquisition = attribution();
      started = true;
      collect([['landing_page_viewed', {}]]);
      flush();
    } catch { stopped = true; }
  }

  function click(event) {
    if (!event.isTrusted || event.defaultPrevented ||
        (event.type === 'click' ? event.button !== 0 : event.button !== 1)) return;
    const anchor = event.target?.closest?.('a[data-analytics-download]');
    if (!anchor) return;
    const placement = anchor.dataset.analyticsPlacement;
    const destination = anchor.dataset.analyticsDownload;
    const href = anchor.getAttribute('href');
    if (destination === 'section' && placement === 'hero' && href === '#platforms') {
      collect([['landing_download_clicked', { placement }]]);
    } else if (destination === 'github_releases' && ['platforms', 'final', 'footer'].includes(placement) &&
        href === 'https://github.com/TrinkieYinkie/Yinkie_releases/releases') {
      collect([
        ['landing_download_clicked', { placement }],
        ['landing_download_outbound_clicked', { placement, destination: 'github_releases' }],
      ]);
    } else return;
    flush();
  }

  document.addEventListener('click', click);
  document.addEventListener('auxclick', click);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') { start(); schedule(); }
    else flush();
  });
  document.addEventListener('prerenderingchange', start);
  globalThis.addEventListener('pagehide', () => { departing = true; flush(); });
  globalThis.addEventListener('pageshow', () => { departing = false; start(); schedule(); });
  start();
})();
