(() => {
'use strict';
const locales = globalThis.YinkieLocales;

const root = document.documentElement;
const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} },
};
const languageButtons = [...document.querySelectorAll('[data-locale]')];
const themeButton = document.querySelector('[data-theme-toggle]');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const supported = (value) => typeof value === 'string' && Object.hasOwn(locales, value.toLowerCase().split('-')[0]) ? value.toLowerCase().split('-')[0] : undefined;
const savedLanguage = supported(storage.get('yinkie-site-locale'));
const language = savedLanguage || (navigator.languages || [navigator.language]).map(supported).find(Boolean) || 'en';

function setLanguage(locale) {
  if (!Object.hasOwn(locales, locale)) return;
  const messages = locales[locale];
  root.lang = locale;
  for (const element of document.querySelectorAll('[data-i18n]')) {
    const message = messages[element.dataset.i18n];
    if (message !== undefined) element.textContent = message;
  }
  for (const [data, attribute] of [['data-i18n-label', 'aria-label'], ['data-i18n-alt', 'alt']]) {
    for (const element of document.querySelectorAll('[' + data + ']')) {
      const message = messages[element.getAttribute(data)];
      if (message !== undefined) element.setAttribute(attribute, message);
    }
  }
  for (const button of languageButtons) button.setAttribute('aria-pressed', String(button.dataset.locale === locale));
  document.title = messages['meta.title'];
  for (const selector of ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]']) {
    document.querySelector(selector)?.setAttribute('content', messages['meta.description']);
  }
  for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
    document.querySelector(selector)?.setAttribute('content', messages['meta.title']);
  }
}

function syncTheme() {
  const selected = storage.get('yinkie-site-theme');
  const explicit = selected === 'light' || selected === 'dark';
  if (explicit) root.dataset.theme = selected;
  else delete root.dataset.theme;
  const dark = explicit ? selected === 'dark' : systemTheme.matches;
  themeButton.setAttribute('aria-pressed', String(dark));
  document.querySelector('meta[name="theme-color"]').setAttribute('content', dark ? '#191a1e' : '#f6f5f2');
}

for (const button of languageButtons) {
  button.addEventListener('click', () => {
    setLanguage(button.dataset.locale);
    storage.set('yinkie-site-locale', button.dataset.locale);
  });
}
themeButton.addEventListener('click', () => {
  const next = themeButton.getAttribute('aria-pressed') === 'true' ? 'light' : 'dark';
  // Apply immediately even when storage is unavailable.
  root.dataset.theme = next;
  themeButton.setAttribute('aria-pressed', String(next === 'dark'));
  document.querySelector('meta[name="theme-color"]').setAttribute('content', next === 'dark' ? '#191a1e' : '#f6f5f2');
  storage.set('yinkie-site-theme', next);
});
systemTheme.addEventListener('change', () => { if (!root.dataset.theme) syncTheme(); });
window.addEventListener('storage', (event) => {
  if (event.key === 'yinkie-site-theme') syncTheme();
  if (event.key === 'yinkie-site-locale') setLanguage(supported(event.newValue) || 'en');
});
setLanguage(language);
syncTheme();
for (const element of document.querySelectorAll('[data-enhancement]')) element.hidden = false;

})();
