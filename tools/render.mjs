#!/usr/bin/env node
// Writes every generated README part from repo.json, tools/languages.json and the project and example files.
//
//   node tools/render.mjs           update the READMEs
//   node tools/render.mjs --check   change nothing; exit 1 if any README is out of date

import { loadConfig } from './lib/repo.mjs';
import { renderAll } from './lib/blocks.mjs';

const checkOnly = process.argv.includes('--check');
const { changed, errors } = renderAll(loadConfig(), { write: !checkOnly });

for (const e of errors) console.log(`ERROR ${e}`);
for (const f of changed) console.log(`${checkOnly ? 'OUT OF DATE' : 'updated'} ${f}`);
if (!errors.length && !changed.length) console.log('All generated parts are up to date.');
process.exitCode = errors.length || (checkOnly && changed.length) ? 1 : 0;
