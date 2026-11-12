#!/usr/bin/env node
// Makes a new project from tools/templates/project, on the main branch.
//
//   node tools/new-project.mjs <slug> --title "Parking lot project" --lesson <lesson-slug>
//
// It creates projects/<slug>/ with project.json, the README, an empty demo-output.txt, and for every
// course language a README and a starter/ folder holding that language's test runner. Then it fills
// the generated README parts. The writer adds the code, the tests and the hand-written README parts.

import fs from 'node:fs';
import path from 'node:path';
import { ROOT, rel, loadConfig, readText, names, currentBranch } from './lib/repo.mjs';
import { renderAll } from './lib/blocks.mjs';

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function arg(flag) {
  const i = process.argv.indexOf(flag);
  return i > 0 ? process.argv[i + 1] : undefined;
}

function fail(message) {
  console.error(`new-project: ${message}`);
  process.exit(1);
}

const slug = process.argv[2];
const title = arg('--title');
const lesson = arg('--lesson');
if (!slug || slug.startsWith('--') || !title || !lesson) {
  fail('usage: node tools/new-project.mjs <slug> --title "Title" --lesson <lesson-slug>');
}
if (!SLUG.test(slug)) fail(`"${slug}" must be lowercase words joined by hyphens, such as parking-lot`);
if (!SLUG.test(lesson)) fail(`lesson "${lesson}" must be lowercase words joined by hyphens`);

const config = loadConfig();
const { repo, languages } = config;
if (!repo.folders.projects) fail('repo.json has no "projects" folder');

const branch = await currentBranch();
if (branch && branch !== repo.branches.main) {
  fail(`you are on "${branch}". New projects start on "${repo.branches.main}", then main is merged into "${repo.branches.solutions}".`);
}

const dir = path.join(ROOT, repo.folders.projects, slug);
if (fs.existsSync(dir)) fail(`${rel(dir)} already exists`);

const templates = path.join(ROOT, 'tools', 'templates', 'project');
const n = names(slug);
const vars = { slug, title, lesson, course: repo.course, version: repo.version, snake: n.snake, Pascal: n.pascal };
const fillTemplate = (text, extra = {}) =>
  text.replace(/\{\{(\w+)\}\}/g, (m, key) => ({ ...vars, ...extra }[key] ?? m)); // writer's placeholders stay

const created = [];
const write = (file, text) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  created.push(rel(file));
};

write(path.join(dir, 'project.json'), fillTemplate(readText(path.join(templates, 'project.json'))));
write(path.join(dir, 'README.md'), fillTemplate(readText(path.join(templates, 'README.md'))));
write(path.join(dir, 'demo-output.txt'), '');

const languageReadme = readText(path.join(templates, 'LANGUAGE-README.md'));
for (const lang of repo.languages) {
  const def = languages[lang];
  if (!def) fail(`repo.json lists "${lang}", which is not in tools/languages.json`);
  write(path.join(dir, lang, 'README.md'), fillTemplate(languageReadme, { Language: def.name }));
  const starter = path.join(dir, lang, 'starter');
  fs.mkdirSync(starter, { recursive: true });
  if (def.runner) {
    const runnerDir = path.join(ROOT, 'tools', 'runners', def.runner);
    for (const f of fs.readdirSync(runnerDir).filter((x) => x !== 'README.md')) {
      write(path.join(starter, f), readText(path.join(runnerDir, f)));
    }
  }
}

const { errors } = renderAll(config, { write: true });
const ours = errors.filter((e) => e.includes(`/${slug}/`));

console.log(`Created ${rel(dir)}:`);
for (const f of created) console.log(`  ${f}`);
if (ours.length) for (const e of ours) console.log(`  note: ${e}`);
console.log(`
Next:
  1. Fill project.json: the source files C++ needs, and each round's test names and starterPasses.
  2. Write the starter code and tests in every language, using the file names in docs/STRUCTURE.md.
  3. Write the README's hand-written parts and demo-output.txt.
  4. Run: node tools/render.mjs, then node tools/check.mjs --project ${slug}
  5. Commit on ${repo.branches.main}, merge into ${repo.branches.solutions}, add each solution/ folder there.`);
