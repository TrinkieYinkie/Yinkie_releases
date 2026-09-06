import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile, readdir, realpath } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const mode = process.argv[2];
if (!process.env.YINKIE_LANDING_TASK || !process.send) throw new Error('Use scripts/lifecycle.mjs; direct stage execution is unsupported.');
let stop = () => {};
let finished = false;
process.on('disconnect', () => { if (!finished) { stop(); process.exit(1); } });
const publicFiles = [
  'index.html', 'styles.css', 'app.js', 'locales.js',
  'CNAME', '.nojekyll', 'robots.txt', 'sitemap.xml',
  'assets/yinkie-icon.png', 'assets/screenshots/yinkie-hero.webp',
  'assets/screenshots/yinkie-source-preview.webp',
  'assets/screenshots/yinkie-workspace-search.webp',
];
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.xml': 'application/xml', '.txt': 'text/plain' };
const read = (file) => readFile(resolve(root, file), 'utf8');

async function server(port) {
  const instance = createServer(async (req, res) => {
    try {
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
      const requested = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname).replace(/^\/+/, '') || 'index.html';
      if (!publicFiles.includes(requested)) { res.writeHead(404); res.end('Not found'); return; }
      const path = await realpath(resolve(root, requested));
      if (!path.startsWith((await realpath(root)) + sep)) { res.writeHead(404); res.end(); return; }
      const body = await readFile(path);
      res.writeHead(200, { 'Content-Type': types[extname(path)] || 'text/plain', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  instance.requestTimeout = 10000;
  instance.headersTimeout = 10000;
  stop = () => { instance.closeAllConnections(); instance.close(); };
  await new Promise((accept, reject) => { instance.once('error', reject); instance.listen(port, '127.0.0.1', accept); });
  return instance;
}

async function validate() {
  const html = await read('index.html');
  const css = await read('styles.css');
  const { locales } = await import('../locales.js');
  const baseline = Object.keys(locales.en).sort();
  for (const [language, messages] of Object.entries(locales)) {
    assert.deepEqual(Object.keys(messages).sort(), baseline, 'Locale keys: ' + language);
    for (const value of Object.values(messages)) assert.ok(typeof value === 'string' && value.trim(), 'Empty translation');
  }
  for (const key of [...html.matchAll(/data-i18n(?:-alt|-label)?="([^"]+)"/g)].map((match) => match[1])) {
    assert.ok(baseline.includes(key), 'Unknown translation: ' + key);
  }
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(ids.length, new Set(ids).size, 'Duplicate IDs');
  for (const anchor of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(anchor[1]), 'Missing anchor ' + anchor[1]);
  for (const asset of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (/^(https:|mailto:)/.test(asset[1])) continue;
    assert.ok(publicFiles.includes(asset[1]), 'Unexpected public reference: ' + asset[1]);
    await readFile(resolve(root, asset[1]));
  }
  for (const file of publicFiles) await readFile(resolve(root, file));
  for (const landmark of ['<header', '<main', '<footer', '<h1']) assert.ok(html.includes(landmark));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(html.includes('https://yinkie.com/'));
  assert.ok(html.includes('https://yinkie.app'));
  assert.ok(html.includes('mailto:support@yinkie.com'));
  assert.ok(css.includes('prefers-reduced-motion'));
  assert.ok(css.includes('scrollbar-thumb:active'));
  assert.ok(!/<select\b/i.test(html), 'No unthemed native picker');
  assert.ok(!/https?:\/\/[^\s)]*fonts|@import/i.test(css), 'Fonts must stay local');
  for (const file of ['index.html', 'styles.css', 'app.js', 'locales.js']) {
    const source = await read(file);
    assert.ok(!/[A-Z]:[\\/]|\/Users\/|\/home\/|api[_-]?key\s*[:=]|github_pat_|ghp_[A-Za-z0-9]/i.test(source), 'Public-data boundary: ' + file);
  }
  const { en, ru, es } = locales;
  assert.match(en['free.body'], /main functionality.*Desktop and Web.*remain free/);
  assert.match(en['free.future'], /not available yet/);
  assert.match(ru['free.future'], /пока нет/);
  assert.match(es['free.future'], /todavía no/);
  console.log('Validated locales, product contract, assets, anchors, metadata and public-data rules.');
}

async function main() {
  if (mode === 'selftest') {
    assert.equal(process.permission.has('child'), false);
    assert.equal(process.permission.has('worker'), false);
    assert.throws(() => spawn(process.execPath, ['--version']), { code: 'ERR_ACCESS_DENIED' });
    console.log('Subprocesses and workers are prohibited; owner directly holds the entire child tree.');
  } else if (mode === 'validate') {
    await validate();
  } else if (mode === 'build') {
    const out = resolve(root, 'dist');
    await mkdir(out, { recursive: true });
    // Fail closed on unexpected output. Never recursively delete unknown files.
    async function inventory(dir, prefix = '') {
      for (const item of await readdir(dir, { withFileTypes: true })) {
        const path = prefix + item.name;
        if (item.isDirectory()) await inventory(resolve(dir, item.name), path + '/');
        else assert.ok(publicFiles.includes(path), 'Unexpected dist file: ' + path);
      }
    }
    await inventory(out);
    for (const file of publicFiles) {
      const destination = resolve(out, file);
      await mkdir(resolve(destination, '..'), { recursive: true });
      await writeFile(destination, await readFile(resolve(root, file)));
    }
    console.log('Built ' + publicFiles.length + ' allowlisted public files into dist.');
  } else if (mode === 'output-check') {
    for (const file of publicFiles) assert.deepEqual(await readFile(resolve(root, file)), await readFile(resolve(root, 'dist', file)), 'Output mismatch: ' + file);
    console.log('Output is byte-identical to the reviewed public source.');
  } else if (mode === 'http-check') {
    const instance = await server(0);
    const origin = 'http://127.0.0.1:' + instance.address().port;
    try {
      for (const file of ['/', '/styles.css', '/app.js', '/locales.js', '/assets/screenshots/yinkie-hero.webp']) {
        const response = await fetch(origin + file, { signal: AbortSignal.timeout(3000) });
        assert.equal(response.status, 200, file);
        await response.arrayBuffer();
      }
      for (const file of ['/.git/config', '/AGENTS.md', '/samples/04-sunday-citrus-cake.md', '/scripts/lifecycle.mjs', '/%ZZ']) {
        const response = await fetch(origin + file, { signal: AbortSignal.timeout(3000) });
        assert.equal(response.status, 404, 'Private route exposed: ' + file);
        await response.text();
      }
      console.log('Public routes serve; repository internals and samples are unreachable.');
    } finally { stop(); }
  } else if (mode === 'preview') {
    const port = Number(process.env.YINKIE_LANDING_PORT || 4186);
    assert.ok(Number.isInteger(port) && port >= 1024 && port <= 65535);
    await server(port);
    console.log('Yinkie local preview: http://127.0.0.1:' + port + '/');
    await new Promise((accept) => {
      const timer = setTimeout(accept, 14 * 60 * 1000);
      for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.once(signal, () => { clearTimeout(timer); accept(); });
      process.on('message', (message) => { if (message === 'stop') { clearTimeout(timer); accept(); } });
    });
    stop();
  } else throw new Error('Unknown stage');
}

try { await main(); }
finally { finished = true; if (process.connected) process.disconnect(); }
