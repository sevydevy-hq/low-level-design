// Everything the tools know about the repo comes from repo.json and tools/languages.json, read here.
// No course name, repo name, version or language list is written in the tools themselves.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

export function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function readText(file) {
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
}

export function loadConfig() {
  const repo = readJSON(path.join(ROOT, 'repo.json'));
  const { languages, container } = readJSON(path.join(ROOT, 'tools', 'languages.json'));
  // A language's "version" is written once; {version} in its other fields is filled from it.
  for (const def of Object.values(languages)) {
    if (!def.version) continue;
    const put = (s) => (typeof s === 'string' ? s.replace(/\{version\}/g, def.version) : s);
    def.tested = put(def.tested);
    if (def.detect) def.detect.min = put(def.detect.min);
    for (const [k, v] of Object.entries(def.container?.options || {})) def.container.options[k] = put(v);
  }
  return { repo, languages, container };
}

/** parking-lot -> { slug: parking-lot, snake: parking_lot, pascal: ParkingLot } */
export function names(slug) {
  return {
    slug,
    snake: slug.replace(/-/g, '_'),
    pascal: slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(''),
  };
}

/** Replaces {token} with vars.token; unknown tokens are left as they are. */
export function fill(text, vars) {
  return text.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? String(vars[key]) : m));
}

/** Test file, test name (file without extension) and C++ test program for round r (1-based). */
export function roundFiles(langDef, slug, r) {
  const vars = { ...names(slug), n: r };
  const pick = (pair) => (pair ? fill(pair[r === 1 ? 0 : 1], vars) : undefined);
  const testFile = pick(langDef.files.test);
  return { testFile, testName: testFile.replace(/\.[^.]+$/, ''), testBin: pick(langDef.files.testBin) };
}

export const SHELLS = ['bash', 'powershell'];

/** The languages an item (project or example) uses: its own list, or every course language. */
export function itemLanguages(config, item) {
  return item.languages || config.repo.languages;
}

/**
 * The exact command lines for one language, shell and key ("round-1", "round-2"..., or "demo").
 * Overrides in the item win; otherwise the language default is filled in.
 */
export function commandsFor(config, item, lang, shell, key) {
  const override = item.overrides?.commands?.[lang]?.[shell];
  if (Array.isArray(override) && key === 'demo') return override; // examples: one list per shell
  if (override && !Array.isArray(override) && override[key]) return override[key];

  const def = config.languages[lang];
  let vars = { ...names(item.slug), sources: (item.sources?.[lang] || []).join(' ') };
  let template;
  if (key === 'demo') {
    template = def.commands[shell].demo;
  } else {
    const r = Number(key.replace('round-', ''));
    vars = { ...vars, n: r, ...roundFiles(def, item.slug, r) };
    template = def.commands[shell].test;
  }
  return template.map((line) => fill(line, vars).replace(/ {2,}/g, ' ').trim());
}

/** Test names are compared ignoring case, spaces, _ and -. Python's "test_" prefix is dropped. */
export function normalizeTest(name, lang) {
  let n = String(name).trim();
  if (lang === 'python') n = n.replace(/^test_?/, '');
  return n.toLowerCase().replace(/[\s_-]+/g, '');
}

export function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
}

/** Every project folder: { slug, dir, file, data|null } */
export function listProjects(config) {
  const folder = config.repo.folders.projects;
  if (!folder) return [];
  const base = path.join(ROOT, folder);
  return listDirs(base).map((slug) => {
    const dir = path.join(base, slug);
    const file = path.join(dir, 'project.json');
    return { slug, dir, file, data: fs.existsSync(file) ? readJSON(file) : null };
  });
}

/** Every example folder: { lesson, slug, dir, file, data|null } */
export function listExamples(config) {
  const folder = config.repo.folders.examples;
  if (!folder) return [];
  const base = path.join(ROOT, folder);
  return listDirs(base).flatMap((lesson) =>
    listDirs(path.join(base, lesson)).map((slug) => {
      const dir = path.join(base, lesson, slug);
      const file = path.join(dir, 'example.json');
      return { lesson, slug, dir, file, data: fs.existsSync(file) ? readJSON(file) : null };
    }),
  );
}

/** The git branch checked out, or null when git is missing or this is not a repo. */
export async function currentBranch() {
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync('git', ['symbolic-ref', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
}
