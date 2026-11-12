#!/usr/bin/env node
// Builds one ZIP per project, from main, for a release. GitHub's release workflow runs this on a version tag.
//
//   node tools/release.mjs                  ZIPs for the version in repo.json, into dist/<version>/
//   node tools/release.mjs --version v1.0   the same, but fails unless repo.json says v1.0 (used on a tag)
//
// Each ZIP opens into one <slug>/ folder holding what a reader needs and nothing else: the project README,
// demo-output.txt, the setup check scripts, and each language's README and starter/. Never a solution/,
// never project.json. It also writes SHA256SUMS.txt next to the ZIPs.

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ROOT, rel, readText, loadConfig, itemLanguages, listProjects, currentBranch } from './lib/repo.mjs';
import { renderAll } from './lib/blocks.mjs';
import { makeZip } from './lib/zip.mjs';

const argv = process.argv.slice(2);
const opt = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
};
const fail = (message) => {
  console.error(`release: ${message}`);
  process.exit(1);
};

const config = loadConfig();
const { repo } = config;
const version = opt('--version') || repo.version;
if (!/^v[0-9]+\.[0-9]+$/.test(version)) fail(`"${version}" is not a version such as v1.0`);
if (version !== repo.version) {
  fail(`the tag is ${version} but repo.json says ${repo.version}. Set "version" in repo.json, run node tools/render.mjs, commit, then tag.`);
}

const branch = await currentBranch();
if (branch && branch !== repo.branches.main) {
  fail(`ZIPs are built from ${repo.branches.main}, but this is "${branch}". Readers must never get a solution.`);
}

const rendered = renderAll(config, { write: false });
if (rendered.errors.length || rendered.changed.length) {
  [...rendered.errors, ...rendered.changed.map((f) => `${f} is out of date`)].forEach((e) => console.error(`  ${e}`));
  fail('generated parts are not up to date: run node tools/render.mjs and commit first');
}

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  return e.isDirectory() ? walk(full) : [full];
});

const outDir = path.join(ROOT, opt('--out') || 'dist', version);
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const projects = listProjects(config).filter((p) => p.data);
if (!projects.length) {
  console.log(`release ${version}: no projects yet, so no ZIPs.`);
  process.exit(0);
}

const sums = [];
for (const p of projects) {
  const files = [];
  const add = (file) => files.push(file);
  for (const name of ['README.md', 'demo-output.txt', 'check-setup.sh', 'check-setup.ps1', 'check-setup.cmd']) {
    const f = path.join(p.dir, name);
    if (fs.existsSync(f)) add(f);
  }
  for (const lang of itemLanguages(config, p.data)) {
    const langDir = path.join(p.dir, lang);
    if (fs.existsSync(path.join(langDir, 'solution'))) fail(`${rel(langDir)}/solution exists: a release must never contain a solution`);
    const readme = path.join(langDir, 'README.md');
    if (fs.existsSync(readme)) add(readme);
    const own = path.join(langDir, 'demo-output.txt');
    if (fs.existsSync(own)) add(own);
    const starter = path.join(langDir, 'starter');
    if (!fs.existsSync(starter)) fail(`${rel(starter)} is missing`);
    walk(starter).forEach(add);
  }

  const entries = files.map((f) => ({
    name: `${p.slug}/${path.relative(p.dir, f).split(path.sep).join('/')}`,
    data: fs.readFileSync(f),
    mode: f.endsWith('.sh') ? 0o755 : 0o644,
  }));
  const zip = makeZip(entries);
  const zipName = `${p.slug}.zip`;
  fs.writeFileSync(path.join(outDir, zipName), zip);
  sums.push(`${crypto.createHash('sha256').update(zip).digest('hex')}  ${zipName}`);
  console.log(`  ${zipName}: ${entries.length} files, ${(zip.length / 1024).toFixed(1)} KB`);
}

fs.writeFileSync(path.join(outDir, 'SHA256SUMS.txt'), sums.join('\n') + '\n');

// Release notes: the CHANGELOG section headed "## <version>" (for example "## v1.0 (1 Dec 2026)").
const changelog = path.join(ROOT, 'CHANGELOG.md');
const lines = fs.existsSync(changelog) ? readText(changelog).split('\n') : [];
const start = lines.findIndex((l) => l === `## ${version}` || l.startsWith(`## ${version} `));
if (start < 0) {
  if (opt('--version')) fail(`CHANGELOG.md has no "## ${version}" section. Rename "## Unreleased" to "## ${version} (date)" before tagging.`);
  console.log(`  note: CHANGELOG.md has no "## ${version}" section yet, so no release notes were written`);
} else {
  let end = lines.findIndex((l, i) => i > start && l.startsWith('## '));
  if (end < 0) end = lines.length;
  fs.writeFileSync(path.join(outDir, 'NOTES.md'), lines.slice(start + 1, end).join('\n').trim() + '\n');
}
console.log(`release ${version}: ${projects.length} ZIP(s) in ${rel(outDir)}`);
