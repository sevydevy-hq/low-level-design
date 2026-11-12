// Running command lines exactly as a reader would, and reading test results from each language's output.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const TIMEOUT_MS = 120_000;

/** Converts C:\x\y to /mnt/c/x/y for running bash inside WSL. */
function wslPath(p) {
  return p.replace(/^([A-Za-z]):/, (m, d) => `/mnt/${d.toLowerCase()}`).split(path.sep).join('/');
}

const quote = (s) => `'${s.replace(/'/g, `'\\''`)}'`;

/**
 * Runs one line in the given shell, in cwd.
 * via: "native" (bash or powershell on this machine) or "wsl" (bash inside WSL, from Windows).
 */
export function runLine(line, cwd, shell, via = 'native') {
  let cmd;
  let args;
  if (shell === 'powershell') {
    cmd = process.platform === 'win32' ? 'powershell' : 'pwsh';
    args = ['-NoProfile', '-NonInteractive', '-Command', line];
  } else if (via === 'wsl') {
    cmd = 'wsl.exe';
    args = ['bash', '-c', `cd ${quote(wslPath(cwd))} && ${line}`];
    cwd = undefined;
  } else {
    cmd = 'bash';
    args = ['-c', line];
  }
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout: TIMEOUT_MS, maxBuffer: 32 * 1024 * 1024 });
  return {
    line,
    code: r.error ? -1 : r.status,
    output: `${r.stdout || ''}${r.stderr || ''}${r.error ? `\n${r.error.message}` : ''}`.replace(/\r\n/g, '\n'),
    stdout: (r.stdout || '').replace(/\r\n/g, '\n'),
  };
}

/**
 * Runs a list of lines. Every line but the last must succeed (they build). The last line's result is returned,
 * whatever its exit code, because a test program exits non-zero when tests fail.
 */
export function runLines(lines, cwd, shell, via) {
  for (let i = 0; i < lines.length - 1; i++) {
    const r = runLine(lines[i], cwd, shell, via);
    if (r.code !== 0) return { ok: false, failedLine: r.line, output: r.output };
  }
  const last = runLine(lines[lines.length - 1], cwd, shell, via);
  return { ok: true, code: last.code, output: last.output, stdout: last.stdout };
}

/**
 * Reads test results. Returns { pass: [names], fail: [names] } with names as printed.
 * - Our Java and C++ runners: "PASS name" / "FAIL name :: reason".
 * - Python unittest -v: "test_name (module.Class.test_name) ... ok|FAIL|ERROR".
 * - node --test: TAP ("ok 1 - name" / "not ok 1 - name") or the spec reporter ("✔ name (1ms)" / "✖ name (1ms)").
 */
export function parseResults(lang, output) {
  const pass = new Set();
  const fail = new Set();
  const lines = output.split('\n');
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    let m;
    if ((m = line.match(/^PASS (.+)$/))) pass.add(m[1]);
    else if ((m = line.match(/^FAIL (.+?)(?: :: .*)?$/))) fail.add(m[1]);
    else if (lang === 'python' && (m = line.match(/^(test\w*) \([^)]*\)(?: \.\.\. (ok|FAIL|ERROR|skipped.*|expected failure|unexpected success))?$/))) {
      const verdict = m[2];
      if (verdict === 'ok') pass.add(m[1]);
      else if (verdict) fail.add(m[1]);
    } else if (lang === 'javascript') {
      if ((m = line.match(/^\s*(not ok|ok) \d+ - (.+?)(?: # .*)?$/))) (m[1] === 'ok' ? pass : fail).add(m[2]);
      else if ((m = line.match(/^\s*✔ (.+?) \([\d.]+m?s\)$/))) pass.add(m[1]);
      else if ((m = line.match(/^\s*✖ (.+?) \([\d.]+m?s\)$/))) fail.add(m[1]);
    }
  }
  for (const n of pass) if (fail.has(n)) pass.delete(n);
  return { pass: [...pass], fail: [...fail] };
}

/** Copies a folder to a fresh place, so runs never leave build output in the repo. */
export function freshCopy(from, to) {
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
  return to;
}

/** Output compared line by line, ignoring CRLF, trailing spaces and trailing blank lines. */
export function sameOutput(a, b) {
  const norm = (s) => s.replace(/\r\n/g, '\n').split('\n').map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n+$/, '');
  return norm(a) === norm(b);
}
