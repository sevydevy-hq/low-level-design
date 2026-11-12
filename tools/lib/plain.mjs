// Plain-language checks for every page a reader sees, so the guides stay easy for beginners.
// Rules: sentences of at most 25 words (the course's own rule), no talking-down words, and no
// unexplained technical words on the beginner path (project, language and setup pages).
// Code blocks, inline code, links' addresses, tables and HTML comments are not checked.

import fs from 'node:fs';
import path from 'node:path';
import { ROOT, rel, readText, listProjects, listExamples, listDirs } from './repo.mjs';

export const MAX_WORDS = 25;
const TALKING_DOWN = ['simply', 'just', 'easy', 'easily', 'obviously', 'clearly', 'trivial', 'of course', 'basically', 'please'];
// Words a beginner may not know. The front page explains a few in "Words you will see"; the beginner pages avoid them.
const JARGON = ['repository', 'repo', 'branch', 'clone', 'commit', 'merge', 'shell', 'CLI', 'binary', 'executable', 'stdout', 'stderr',
  'dependency', 'dependencies', 'environment variable', 'compile', 'compiler', 'runtime', 'directory'];

/** Reader-facing pages, and whether each is on the beginner path (stricter word list). */
export function readerPages(config) {
  const pages = [{ file: path.join(ROOT, 'README.md'), beginner: false }];
  const setup = path.join(ROOT, config.repo.folders.setup);
  if (fs.existsSync(setup)) {
    for (const f of fs.readdirSync(setup).filter((x) => x.endsWith('.md'))) pages.push({ file: path.join(setup, f), beginner: true });
  }
  for (const p of listProjects(config)) {
    pages.push({ file: path.join(p.dir, 'README.md'), beginner: true });
    for (const l of listDirs(p.dir)) pages.push({ file: path.join(p.dir, l, 'README.md'), beginner: true });
  }
  for (const e of listExamples(config)) pages.push({ file: path.join(e.dir, 'README.md'), beginner: true });
  return pages.filter((x) => fs.existsSync(x.file));
}

/** The prose of a Markdown page: one entry per paragraph or list item, with code, links' addresses and tables removed. */
function prose(markdown) {
  const text = markdown
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]*`/g, 'CODE')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/https?:\/\/\S+/g, 'LINK')
    .replace(/<[^>]+>/g, ' ');
  const blocks = [];
  let current = [];
  for (const line of text.split('\n')) {
    const t = line.trim();
    const startsItem = /^([-*]|\d+\.)\s/.test(t);
    if (!t || t.startsWith('|') || t.startsWith('#') || startsItem) {
      if (current.length) blocks.push(current.join(' '));
      current = [];
      if (startsItem) current.push(t.replace(/^([-*]|\d+\.)\s+/, ''));
      if (t.startsWith('#')) blocks.push(t.replace(/^#+\s*/, ''));
      continue;
    }
    current.push(t);
  }
  if (current.length) blocks.push(current.join(' '));
  return blocks;
}

export function checkPage({ file, beginner }) {
  const problems = [];
  const where = rel(file);
  const blocks = prose(readText(file));
  for (const block of blocks) {
    const sentences = block.split(/(?<=[.!?])\s+(?=[A-Z"(`*CODE])/);
    for (const s of sentences) {
      const words = s.replace(/[*_]/g, '').split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w));
      if (words.length > MAX_WORDS) problems.push(`${where}: sentence of ${words.length} words (at most ${MAX_WORDS}): "${s.slice(0, 80)}..."`);
    }
    for (const w of TALKING_DOWN) {
      if (new RegExp(`\\b${w}\\b`, 'i').test(block)) problems.push(`${where}: "${w}" talks down to the reader; cut it or say what to do`);
    }
    if (beginner) {
      for (const w of JARGON) {
        if (new RegExp(`\\b${w}\\b`, w === 'CLI' ? '' : 'i').test(block)) problems.push(`${where}: "${w}" is jargon for a beginner; say it in plain words`);
      }
    }
  }
  return [...new Set(problems)];
}
