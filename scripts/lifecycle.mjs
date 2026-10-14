import { spawn } from 'node:child_process';
import { open, readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const lockPath = resolve(root, '.landing-run.lock');
const mode = process.argv[2];
const stagePath = resolve(root, 'scripts/stage.mjs');
const syntax = (file) => ({ name: 'Syntax: ' + file, args: ['--check', resolve(root, file)], timeout: 10000 });
const stage = (name, timeout = 15000) => ({ name, args: [stagePath, name], timeout });
const checks = [syntax('scripts/lifecycle.mjs'), syntax('scripts/stage.mjs'), syntax('app.js'), syntax('locales.js'), syntax('analytics-config.js'), syntax('analytics.js'), syntax('scripts/analytics.test.mjs'), stage('analytics-test'), stage('validate'), stage('http-check')];
const plans = {
  unified: [syntax('landing-analytics.js'), syntax('landing-analytics-ui.js'), stage('unified-analytics-test', 30000)],
  foundation: [syntax('scripts/lifecycle.mjs'), syntax('scripts/stage.mjs'), stage('selftest')],
  check: checks,
  build: [...checks, stage('build'), stage('output-check')],
  preview: [stage('preview', 15 * 60 * 1000)],
};
let lock;
let child;
let interrupted = false;
const token = randomUUID();

async function main() {
  if (mode === 'audit') {
    try {
      const state = JSON.parse(await readFile(lockPath, 'utf8'));
      throw new Error('A lifecycle lock remains; inspect its exact owner before continuing: ' + JSON.stringify(state));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      console.log('PASS: no landing lifecycle lock. No other process is terminated by audit.');
      return;
    }
  }
  if (!plans[mode]) throw new Error('Usage: node scripts/lifecycle.mjs foundation|check|build|preview|audit');
  if (Number(process.versions.node.split('.')[0]) < 24) throw new Error('Node 24 or newer is required for restricted child execution.');
  lock = await open(lockPath, 'wx');
  await lock.writeFile(JSON.stringify({ pid: process.pid, token, startedAt: new Date().toISOString(), mode }));
  console.log('OWNER pid=' + process.pid + ' token=' + token + ' mode=' + mode);
  if (mode === 'preview') {
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (data) => { if (data.trim() === 'stop' && child?.connected) child.send('stop'); });
    console.log('Send stop on stdin to close preview and release its lock.');
  }
  for (const step of plans[mode]) {
    if (interrupted) throw new Error('Interrupted');
    await run(step);
  }
}

async function run(step) {
  console.log('START ' + step.name + ' (deadline ' + step.timeout + 'ms)');
  const started = Date.now();
  const permissions = ['--permission', '--allow-fs-read=' + root];
  if (step.name === 'build') permissions.push('--allow-fs-write=' + resolve(root, 'dist'), '--allow-fs-write=' + resolve(root, 'dist') + '/*');
  // No allow-child-process, allow-worker or addons: descendants cannot escape
  // the exact ChildProcess handle owned here. IPC closes if the owner dies.
  const owned = spawn(process.execPath, [...permissions, ...step.args], {
    cwd: root, shell: false, windowsHide: true,
    env: { ...process.env, YINKIE_LANDING_TASK: token },
    stdio: ['ignore', 'inherit', 'inherit', 'ipc'],
  });
  child = owned;
  let timedOut = false;
  const heartbeat = setInterval(() => console.log('HEARTBEAT ' + step.name + ' pid=' + owned.pid + ' elapsed=' + (Date.now() - started) + 'ms'), 10000);
  const timeout = setTimeout(() => { timedOut = true; owned.kill('SIGKILL'); }, step.timeout);
  try {
    const code = await new Promise((accept, reject) => {
      owned.once('error', reject);
      owned.once('close', accept);
    });
    if (timedOut) throw new Error(step.name + ' timed out');
    if (interrupted) throw new Error('Interrupted');
    if (code !== 0) throw new Error(step.name + ' failed: ' + code);
    console.log('PASS ' + step.name + ' (' + (Date.now() - started) + 'ms)');
  } finally {
    clearInterval(heartbeat);
    clearTimeout(timeout);
    if (owned.exitCode === null && owned.signalCode === null) {
      owned.kill('SIGKILL');
      await new Promise((accept) => owned.once('close', accept));
    }
    child = undefined;
  }
}

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => { interrupted = true; child?.kill('SIGKILL'); });
}

try {
  await main();
} catch (error) {
  console.error(error.code === 'EEXIST' ? 'Another landing run owns the lock. Its lock is preserved.' : error.message);
  process.exitCode = 1;
} finally {
  process.stdin.pause();
  // Only this run's acquired lock may be removed; a duplicate run owns nothing.
  if (lock) {
    await lock.close();
    await rm(lockPath);
  }
}
