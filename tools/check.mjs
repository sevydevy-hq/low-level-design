#!/usr/bin/env node
// Checks the whole repo, as described in docs/STRUCTURE.md section 10. GitHub runs this same script.
//
//   node tools/check.mjs                       everything, in this machine's shell
//   node tools/check.mjs --static              only the files and rules, no code is run
//   node tools/check.mjs --project parking-lot --lang java,python
//   node tools/check.mjs --shell bash --via wsl   (on Windows) run the bash commands inside WSL
//   node tools/check.mjs --branch solutions    apply that branch's rules (GitHub: pull requests and tags)
//   node tools/check.mjs --list-languages      print the course languages as JSON
//   node tools/check.mjs --matrix              print [{language, version}] for GitHub's check matrix
//
// Exit code 0 only when every check passes.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  ROOT, rel, readJSON, readText, loadConfig, itemLanguages, commandsFor, roundFiles,
  normalizeTest, listProjects, listExamples, listDirs, currentBranch,
} from './lib/repo.mjs';
import { validate } from './lib/schema.mjs';
import { renderAll } from './lib/blocks.mjs';
import { runLines, parseResults, freshCopy, sameOutput } from './lib/run.mjs';
import { readerPages, checkPage } from './lib/plain.mjs';

// ---------- options ----------

const argv = process.argv.slice(2);
const opt = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
};
const config = loadConfig();
const { repo, languages } = config;

if (argv.includes('--list-languages')) {
  console.log(JSON.stringify(repo.languages));
  process.exit(0);
}
if (argv.includes('--matrix')) {
  // For GitHub's check matrix: each course language with the version to install ("" when the system has it).
  console.log(JSON.stringify(repo.languages.map((l) => ({ language: l, version: languages[l]?.version || '' }))));
  process.exit(0);
}

const shell = opt('--shell') || (process.platform === 'win32' ? 'powershell' : 'bash');
const via = opt('--via') || 'native';
const onlyProject = opt('--project');
const onlyLangs = opt('--lang') ? opt('--lang').split(',') : null;
const staticOnly = argv.includes('--static');
const wantLang = (l) => !onlyLangs || onlyLangs.includes(l);

// ---------- reporting ----------

const problems = [];
const passed = [];
const problem = (where, message) => problems.push(`${where}: ${message}`);
const tail = (text, n = 12) => text.trim().split('\n').slice(-n).map((l) => `      | ${l}`).join('\n');

// ---------- 1. the four kinds of JSON file ----------

const schema = (name) => readJSON(path.join(ROOT, 'tools', 'schema', `${name}.schema.json`));
const checkSchema = (name, file, data) => {
  const errs = validate(schema(name), data);
  errs.forEach((e) => problem(rel(file), e));
  return errs.length === 0;
};

checkSchema('repo', path.join(ROOT, 'repo.json'), repo);
checkSchema('languages', path.join(ROOT, 'tools', 'languages.json'), readJSON(path.join(ROOT, 'tools', 'languages.json')));
for (const l of repo.languages) if (!languages[l]) problem('repo.json', `language "${l}" is not in tools/languages.json`);
for (const [key, folder] of Object.entries(repo.folders)) {
  if (!fs.existsSync(path.join(ROOT, folder))) problem('repo.json', `folders.${key}: "${folder}/" does not exist`);
}

const projects = listProjects(config).filter((p) => !onlyProject || p.slug === onlyProject);
const examples = onlyProject ? [] : listExamples(config);
if (onlyProject && !projects.length) problem('check', `no project "${onlyProject}"`);

// ---------- 2. branch ----------

// --branch says which branch's rules apply when git has no named branch checked out (pull requests, tags on GitHub).
const branch = opt('--branch') || (await currentBranch());
const onMain = branch === repo.branches.main;
const onSolutions = branch === repo.branches.solutions;
if (!onMain && !onSolutions) {
  passed.push(`note: branch is "${branch ?? 'unknown'}", so starter/ and solution/ are checked wherever they exist`);
}

// ---------- 3. projects: files and rules ----------

const kindsToRun = [];

for (const p of projects) {
  const where = rel(p.dir);
  if (!p.data) {
    problem(where, 'has no project.json');
    continue;
  }
  if (!checkSchema('project', p.file, p.data)) continue;
  const d = p.data;
  const langs = itemLanguages(config, d);

  if (d.slug !== p.slug) problem(where, `project.json slug "${d.slug}" differs from the folder name`);
  if (!fs.existsSync(path.join(p.dir, 'README.md'))) problem(where, 'README.md is missing');
  if (d.demo !== false && !fs.existsSync(path.join(p.dir, 'demo-output.txt'))) problem(where, 'demo-output.txt is missing');
  for (const l of langs) if (!repo.languages.includes(l)) problem(where, `language "${l}" is not a course language in repo.json`);
  for (const folder of listDirs(p.dir)) if (!langs.includes(folder)) problem(where, `folder "${folder}/" is not one of the project's languages`);

  d.rounds.forEach((round, i) => {
    const r = i + 1;
    const norm = round.tests.map((t) => normalizeTest(t));
    if (!round.tests.length) problem(where, `round ${r} lists no tests`);
    if (new Set(norm).size !== norm.length) problem(where, `round ${r} has two tests with the same name (ignoring case, spaces, _ and -)`);
    for (const t of round.starterPasses) {
      if (!norm.includes(normalizeTest(t))) problem(where, `round ${r} starterPasses "${t}" is not one of its tests`);
    }
  });

  for (const l of langs) {
    const def = languages[l];
    if (!def) continue;
    const langDir = path.join(p.dir, l);
    if (!fs.existsSync(langDir)) {
      problem(where, `${l}/ is missing`);
      continue;
    }
    if (!fs.existsSync(path.join(langDir, 'README.md'))) problem(`${where}/${l}`, 'README.md is missing');

    const kinds = [];
    const has = (k) => fs.existsSync(path.join(langDir, k));
    if (has('starter')) kinds.push('starter');
    else problem(`${where}/${l}`, 'starter/ is missing');
    if (has('solution')) {
      if (onMain) problem(`${where}/${l}`, `solution/ must not be on ${repo.branches.main}; it belongs on ${repo.branches.solutions}`);
      else kinds.push('solution');
    } else if (onSolutions) {
      problem(`${where}/${l}`, `solution/ is missing on ${repo.branches.solutions}`);
    }

    for (const kind of kinds) {
      const kdir = path.join(langDir, kind);
      const need = d.rounds.map((_, i) => roundFiles(def, d.slug, i + 1).testFile);
      if (d.demo !== false) need.push(def.files.demo);
      need.push(...(d.sources?.[l] || []));
      for (const f of need) if (!fs.existsSync(path.join(kdir, f))) problem(`${where}/${l}/${kind}`, `${f} is missing`);

      if (def.runner) {
        const runnerDir = path.join(ROOT, 'tools', 'runners', def.runner);
        for (const f of fs.readdirSync(runnerDir).filter((x) => x !== 'README.md')) {
          const copy = path.join(kdir, f);
          if (!fs.existsSync(copy)) problem(`${where}/${l}/${kind}`, `${f} (test runner) is missing`);
          else if (readText(copy) !== readText(path.join(runnerDir, f))) {
            problem(`${where}/${l}/${kind}`, `${f} differs from tools/runners/${def.runner}/${f}`);
          }
        }
      }
      if (wantLang(l)) kindsToRun.push({ p, d, l, kind, kdir });
    }
  }
}

// ---------- 4. examples: files and rules ----------

const examplesToRun = [];
for (const e of examples) {
  const where = rel(e.dir);
  if (!e.data) {
    problem(where, 'has no example.json');
    continue;
  }
  if (!checkSchema('example', e.file, e.data)) continue;
  const d = e.data;
  if (d.slug !== e.slug) problem(where, `example.json slug "${d.slug}" differs from the folder name`);
  if (!d.lessons.includes(e.lesson)) problem(where, `lessons should include "${e.lesson}", the folder it sits in`);
  if (!fs.existsSync(path.join(e.dir, 'README.md'))) problem(where, 'README.md is missing');
  if (d.sameOutput && !fs.existsSync(path.join(e.dir, 'expected-output.txt'))) problem(where, 'expected-output.txt is missing');
  for (const l of itemLanguages(config, d)) {
    const def = languages[l];
    const ldir = path.join(e.dir, l);
    if (!def || !fs.existsSync(ldir)) {
      problem(where, `${l}/ is missing`);
      continue;
    }
    if (!fs.existsSync(path.join(ldir, def.files.demo))) problem(`${where}/${l}`, `${def.files.demo} is missing`);
    if (!d.sameOutput && !fs.existsSync(path.join(ldir, 'expected-output.txt'))) problem(`${where}/${l}`, 'expected-output.txt is missing');
    if (wantLang(l)) examplesToRun.push({ e, d, l, ldir });
  }
}

// ---------- 5. unfilled template placeholders ----------

for (const item of [...projects, ...examples]) {
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((x) =>
    x.isDirectory() ? walk(path.join(dir, x.name)) : [path.join(dir, x.name)]);
  for (const f of walk(item.dir)) {
    if (!/\.(md|json|txt)$/.test(f)) continue;
    const found = readText(f).match(/\{\{[^}]+\}\}/g);
    if (found) problem(rel(f), `unfilled template placeholder ${[...new Set(found)].slice(0, 3).join(', ')}`);
  }
}

// ---------- 6. generated README parts ----------

const rendered = renderAll(config, { write: false });
rendered.errors.forEach((e) => problem('render', e));
rendered.changed.forEach((f) => problem(f, 'generated parts are out of date: run node tools/render.mjs'));

// ---------- 6b. plain language on every page a reader sees ----------

for (const page of readerPages(config)) {
  for (const p of checkPage(page)) problems.push(p);
}

// ---------- 7. run the code ----------

const workDir = path.join(ROOT, '.check');

if (!staticOnly) {
  for (const { p, d, l, kind, kdir } of kindsToRun) {
    const label = `${rel(p.dir)}/${l}/${kind}`;
    const cwd = freshCopy(kdir, path.join(workDir, p.slug, l, kind));

    d.rounds.forEach((round, i) => {
      const r = i + 1;
      const res = runLines(commandsFor(config, d, l, shell, `round-${r}`), cwd, shell, via);
      if (!res.ok) {
        problem(label, `round ${r}: "${res.failedLine}" failed\n${tail(res.output)}`);
        return;
      }
      const { pass, fail } = parseResults(l, res.output);
      const got = new Map([...pass.map((n) => [normalizeTest(n, l), true]), ...fail.map((n) => [normalizeTest(n, l), false])]);
      const expected = round.tests.map((t) => [normalizeTest(t), t]);
      const shouldPass = new Set((kind === 'solution' ? round.tests : round.starterPasses).map((t) => normalizeTest(t)));
      const before = problems.length;

      for (const [key, name] of expected) {
        if (!got.has(key)) problem(label, `round ${r}: test "${name}" did not run`);
        else if (got.get(key) && !shouldPass.has(key)) problem(label, `round ${r}: "${name}" passes, but it should fail ${kind === 'starter' ? 'before the reader writes the code' : ''}`.trim());
        else if (!got.get(key) && shouldPass.has(key)) problem(label, `round ${r}: "${name}" fails, but it should pass`);
      }
      const known = new Set(expected.map(([k]) => k));
      for (const [key] of got) if (!known.has(key)) problem(label, `round ${r}: ran a test not listed in project.json (normalized name "${key}")`);
      if (problems.length > before) problems[problems.length - 1] += `\n${tail(res.output)}`;
      else passed.push(`ok   ${label} round ${r}: ${pass.length} passed, ${fail.length} failed, as expected`);
    });

    if (kind === 'solution' && d.demo !== false) {
      const res = runLines(commandsFor(config, d, l, shell, 'demo'), cwd, shell, via);
      const own = path.join(p.dir, l, 'demo-output.txt');
      const expectedFile = fs.existsSync(own) ? own : path.join(p.dir, 'demo-output.txt');
      if (!res.ok || res.code !== 0) problem(label, `demo did not run\n${tail(res.output)}`);
      else if (!fs.existsSync(expectedFile)) problem(label, 'no demo-output.txt to compare with');
      else if (!sameOutput(res.stdout, readText(expectedFile))) problem(label, `demo output differs from ${rel(expectedFile)}\n${tail(res.stdout)}`);
      else passed.push(`ok   ${label} demo output matches`);
    }
  }

  for (const { e, d, l, ldir } of examplesToRun) {
    const label = `${rel(e.dir)}/${l}`;
    const cwd = freshCopy(ldir, path.join(workDir, 'examples', e.lesson, e.slug, l));
    const res = runLines(commandsFor(config, d, l, shell, 'demo'), cwd, shell, via);
    const expectedFile = d.sameOutput ? path.join(e.dir, 'expected-output.txt') : path.join(ldir, 'expected-output.txt');
    if (!res.ok || res.code !== 0) problem(label, `did not run\n${tail(res.output)}`);
    else if (!fs.existsSync(expectedFile)) problem(label, 'no expected-output.txt to compare with');
    else if (!sameOutput(res.stdout, readText(expectedFile))) problem(label, `output differs from ${rel(expectedFile)}\n${tail(res.stdout)}`);
    else passed.push(`ok   ${label} output matches`);
  }
  fs.rmSync(workDir, { recursive: true, force: true });
}

// ---------- 8. the solutions branch matches main outside solution/ folders ----------

if (onSolutions) {
  const exists = (ref) => spawnSync('git', ['rev-parse', '--verify', '--quiet', ref], { cwd: ROOT }).status === 0;
  const mainRef = [repo.branches.main, `origin/${repo.branches.main}`].find(exists);
  if (mainRef) {
    const diff = spawnSync('git', ['diff', '--name-only', mainRef, 'HEAD'], { cwd: ROOT, encoding: 'utf8' });
    const drift = diff.stdout.split('\n').filter((f) => f && !/\/solution\//.test(f));
    for (const f of drift) problem(f, `differs from ${repo.branches.main}: make the change on ${repo.branches.main} and merge it in`);
  } else {
    passed.push(`note: no ${repo.branches.main} branch here to compare ${repo.branches.solutions} with`);
  }
}

// ---------- report ----------

const mode = staticOnly ? 'files and rules only' : `${shell}${via === 'wsl' ? ' in WSL' : ''}`;
console.log(`check (${mode}): ${projects.length} project(s), ${examples.length} example(s), branch ${branch ?? 'unknown'}`);
for (const line of passed) console.log(line);
for (const line of problems) console.log(`FAIL ${line}`);
console.log(problems.length ? `\n${problems.length} problem(s).` : '\nEverything passes.');
process.exitCode = problems.length ? 1 : 0;
