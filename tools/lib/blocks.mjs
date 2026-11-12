// The generated README parts: what goes between <!-- generated:NAME --> and <!-- /generated -->.
// Each part is built only from repo.json, tools/languages.json and a project's or example's JSON file.
//
// Written for beginners: one rule ("open a terminal in the project folder"), numbered steps, the exact
// command for each system with no placeholders to replace, what you should see, and what to do if not.

import fs from 'node:fs';
import path from 'node:path';
import { ROOT, rel, readText, commandsFor, itemLanguages, listProjects, listExamples } from './repo.mjs';

const MARKER = /<!-- generated:([a-z0-9-]+) -->\n([\s\S]*?)<!-- \/generated -->/g;
const SHELL_TITLE = { bash: 'Mac and Linux', powershell: 'Windows' };
const SHELL_ORDER = ['powershell', 'bash']; // Windows first: most beginners use it
const tests = (n) => `${n} ${n === 1 ? 'test' : 'tests'}`;
const atFirst = ({ total, pass }) =>
  pass === 0 ? (total === 1 ? 'At first, it fails.' : `At first, all ${total} fail.`)
    : pass === total ? `At first, ${total === 1 ? 'it already passes' : `all ${total} already pass`}.`
      : `At first, ${pass} of the ${total} ${pass === 1 ? 'passes' : 'pass'} and ${total - pass} ${total - pass === 1 ? 'fails' : 'fail'}.`;
const fillCounts = (s, c) => s.replace(/\{pass\}/g, c.pass).replace(/\{fail\}/g, c.total - c.pass).replace(/\{total\}/g, c.total);
const SAVE_TIP = 'Save the file before you run the tests (Ctrl+S on Windows and Linux, Cmd+S on a Mac). The tests only see saved code.';
const UP_TIP = 'Tip: the **Up arrow** key brings back commands you typed before. Press it until you see the test command (not the `cd` line), then press Enter.';
const COME_BACK = 'Opened a new terminal since step 3, for example after a break? Run the `cd` line from step 3 first, so you are in the `starter` folder.';
const HOW_TO_READ = '**New to this?** This guide is easiest to read on GitHub, or in VS Code. In VS Code, open the project folder, click `README.md`, and press Ctrl+Shift+V (Cmd+Shift+V on a Mac). Opened in Notepad or TextEdit, it shows extra symbols.';

/** The files a reader edits: everything in starter/ except tests, the test runner and the demo program. */
function filesToEdit(config, p, lang, dir) {
  const starter = path.join(dir, lang, 'starter');
  if (!fs.existsSync(starter)) return [];
  const def = config.languages[lang];
  const runnerDir = def.runner ? path.join(ROOT, 'tools', 'runners', def.runner) : null;
  const skip = new Set([def.files.demo, ...(runnerDir && fs.existsSync(runnerDir) ? fs.readdirSync(runnerDir) : [])]);
  const testPattern = (t) => new RegExp('^' + t.replace(/[.]/g, '\\.').replace(/\{n\}/g, '[0-9]+').replace(/\{(slug|snake|pascal)\}/g, '[A-Za-z0-9_-]+') + '$');
  const tests = def.files.test.map(testPattern);
  return fs.readdirSync(starter).filter((f) => !skip.has(f) && !tests.some((re) => re.test(f)) && !f.endsWith('.json')).sort();
}

/** "Look for this line" for one language: what a test run prints at first, and when every test passes. */
function resultLines(config, lang, counts) {
  const r = config.languages[lang].results;
  if (!r) return '';
  return `Look at the last lines it prints. At first: \`${fillCounts(r.start, counts)}\`. When you are done: \`${fillCounts(r.done, counts)}\`.${r.note ? ` ${r.note}` : ''}`;
}
const whenDone = ({ total }) => `When you are done, ${total === 1 ? 'it passes' : `all ${total} pass`}.`;
const codeBlock = (lang, lines) => ['```' + lang, ...lines, '```'].join('\n');
const langName = (config, lang) => config.languages[lang].name;
const cdInto = (shell, ...parts) => `cd ${parts.join(shell === 'powershell' ? '\\' : '/')}`;

function solutionUrl(config, slug, lang) {
  const { github, version, solutionsTagSuffix, folders } = config.repo;
  return `https://github.com/${github}/tree/${version}${solutionsTagSuffix}/${folders.projects}/${slug}/${lang}/solution`;
}

function setupCheckLine(shell, lang) {
  return shell === 'powershell' ? `.\\check-setup.cmd ${lang}` : `bash check-setup.sh ${lang}`;
}

// ---------- shared wording ----------

function languageList(config, langs) {
  return ['| Language | Version we test with |', '|---|---|', ...langs.map((l) => `| ${langName(config, l)} | ${config.languages[l].tested} |`)].join('\n');
}

function prerequisites(config, langs, { project }) {
  return [
    'You need three things:',
    '',
    `1. **One programming language** from this list. You need only one, so pick the one you know best. Newer versions usually work too.`,
    '',
    languageList(config, langs),
    '',
    '2. **A code editor** to change the files. Any editor works. [VS Code](https://code.visualstudio.com/) is free and runs on Windows, Mac and Linux.',
    '3. **A terminal**: the window where you type commands. Every computer already has one.',
    '',
    `You don't need git, a GitHub account or any other tool. ${project ? 'The project carries everything else it needs.' : 'Each project carries everything else it needs.'}`,
    '',
    `You should already know the basics of your language: how to write a class, a method and a loop.`,
  ].join('\n');
}

/** For readers who are looking at the project on GitHub and have nothing on their computer yet. */
function getTheFiles() {
  return 'Reading this on GitHub? Get the files onto your computer first: go back to the lesson and click **Download project**. Then follow these steps on your computer.';
}

function openTerminal(folderName) {
  return [
    `Every command in this guide runs in a terminal that is open **in the \`${folderName}\` folder**.`,
    '',
    'If you downloaded a ZIP file, extract it first. On Windows, right-click the ZIP and choose **Extract All**. On a Mac, double-click it. Commands do not work inside a ZIP.',
    '',
    `- **Windows 11:** in File Explorer, right-click the \`${folderName}\` folder and choose **Open in Terminal**.`,
    `- **Windows 10:** open the \`${folderName}\` folder in File Explorer. Click the address bar at the top, type \`powershell\` and press Enter.`,
    `- **Mac:** open the Terminal app (in Applications, then Utilities). Type \`cd\` and a space, drag the \`${folderName}\` folder from Finder into the window, and press Enter.`,
    `- **Linux:** open the \`${folderName}\` folder in your file manager, right-click an empty area inside it and choose **Open in Terminal**.`,
    '',
    'To check you are in the right place, type `ls` and press Enter. (If the window says Command Prompt, type `dir` instead.) You should see `README.md` in the list.',
    '',
    `If you see a folder called \`${folderName}\` instead of \`README.md\`, the ZIP made a folder inside a folder. Type \`cd ${folderName}\` and press Enter, then check again.`,
  ].join('\n');
}

function setupCheck(config, langs, setupLink) {
  return [
    'Run the setup check for your language. It only looks at what is installed; it never installs or changes anything.',
    '',
    '| Language | Windows | Mac and Linux |',
    '|---|---|---|',
    ...langs.map((l) => `| ${langName(config, l)} | \`${setupCheckLine('powershell', l)}\` | \`${setupCheckLine('bash', l)}\` |`),
    '',
    'Copy the command from your row, paste it into the terminal and press Enter. You will see one of three results:',
    '',
    '- `[ok]`: you are ready. Go to the next step.',
    '- `[old]`: your version is older than the one we test with. Most things still work. If a command fails later, update it.',
    '- `[missing]`: the check prints how to install it (a command, a web page, or both). Install it, close the terminal, open a new one in the same folder, and run the check again.',
    ...(setupLink ? ['', `Step-by-step install guides for each language are in [${setupLink.label}](${setupLink.href}).`] : []),
  ].join('\n');
}

function troubleshooting(config, langs) {
  const names = langs.map((l) => langName(config, l)).join(', ');
  return [
    '<details>',
    '<summary><b>"is not recognized", "command not found", "file not found", "No such file" or "No module named"</b></summary>',
    '',
    'Either the language is not installed yet, or the terminal was opened before you installed it. Close the terminal, open a new one in the project folder (step 1), and run the setup check (step 2).',
    '',
    'If the message names a file or folder, check which folder the terminal is in: type `ls`. In the project folder you see `README.md`. In a `starter` folder you see your code and test files. Test commands run in the `starter` folder.',
    '',
    '</details>',
    '',
    '<details>',
    '<summary><b>"running scripts is disabled on this system" (Windows)</b></summary>',
    '',
    'Use `.\\check-setup.cmd`, not `check-setup.ps1`. The `.cmd` file runs the check without changing any Windows setting.',
    '',
    '</details>',
    '',
    '<details>',
    '<summary><b>Typing python opens the Microsoft Store (Windows)</b></summary>',
    '',
    'Windows has a shortcut that opens the Store instead of Python. Install Python from [python.org](https://www.python.org/downloads/windows/) and tick **Add python.exe to PATH** on the first screen of the installer. Then open a new terminal.',
    '',
    '</details>',
    '',
    '<details>',
    '<summary><b>The tests fail with "not written yet"</b></summary>',
    '',
    'That is expected. The starter leaves those methods for you to write, and each failing test is one thing still to do.',
    '',
    '</details>',
    '',
    `Still stuck? Open an issue on GitHub with your language (${names}), the command you ran and everything it printed.`,
  ].join('\n');
}

// ---------- repo-wide files ----------

function rootReadme(config) {
  const langs = config.repo.languages;
  return {
    prerequisites: prerequisites(config, langs, { project: false }),
    clone: codeBlock('bash', [`git clone https://github.com/${config.repo.github}.git`]),
    codespaces: `[Open this repo in GitHub Codespaces](https://codespaces.new/${config.repo.github}?quickstart=1)`,
  };
}

function setupReadme(config) {
  const langs = config.repo.languages;
  const rows = langs.map((l) => `| ${langName(config, l)} | [Install ${langName(config, l)}](${l}.md) | ${config.languages[l].tested} |`);
  return {
    'setup-guides': ['| Language | Guide | Version we test with |', '|---|---|---|', ...rows].join('\n'),
    'setup-check': setupCheck(config, langs, null),
  };
}

function setupGuide(config, lang) {
  const def = config.languages[lang];
  const { windows, linux, macos } = def.install;
  const install = ['### Windows', ''];
  if (windows.command) {
    install.push(
      '1. Open a terminal: right-click the Start button and choose **Terminal** (on Windows 10, open the Start menu, type `powershell` and press Enter).',
      '2. Copy this command into the terminal and press Enter. If it asks you to agree to terms, type `Y` and press Enter. If Windows asks for permission, choose **Yes**.',
      '',
      codeBlock('powershell', [windows.command]),
      '',
      `   If the terminal says \`winget\` is not recognized, download the installer from ${windows.page} instead and follow its steps.`,
    );
  } else {
    install.push(`1. Download the installer from ${windows.page} and follow its steps.`);
  }
  if (windows.note) install.push('', `   ${windows.note}`);
  install.push('3. Close the terminal when it finishes.', '', '### Linux (Ubuntu or Debian)', '');
  if (linux.command) {
    install.push(
      '1. Open a terminal.',
      '2. Copy this command into the terminal and press Enter. It asks for your password; the password does not show as you type.',
      '',
      codeBlock('bash', [linux.command]),
      '',
      '3. Close the terminal when it finishes.',
      '',
      `On other Linux systems, see ${linux.page}.`,
    );
  } else {
    install.push(`1. Follow the Linux steps on ${linux.page}.`, '2. Close the terminal when it finishes.');
  }
  install.push('', '### Mac', '', `1. Follow the steps on ${macos.page}.`, '2. Close the Terminal app when it finishes.');

  const { bash, powershell } = def.detect;
  return {
    'tested-version': `Version we test with: **${def.tested}**. Newer versions usually work too.`,
    'version-check': [
      "Open a terminal in your project's folder (step 1 of the project's README shows how). Then run the setup check:",
      '',
      `- Windows: \`${setupCheckLine('powershell', lang)}\``,
      `- Mac and Linux: \`${setupCheckLine('bash', lang)}\``,
      '',
      `If it says \`[ok]\`, ${def.name} is ready and you can skip this guide. Without a project, you can also type \`${bash}\`${bash === powershell ? '' : ` (Windows: \`${powershell}\`)`}: if it prints a version number, it is installed.`,
    ].join('\n'),
    install: install.join('\n'),
  };
}

// ---------- projects ----------

function roundCounts(round) {
  const total = round.tests.length;
  const pass = round.starterPasses.length;
  return { total, pass, fail: total - pass };
}

/** One collapsed section per language, with the commands for Windows and for Mac and Linux. */
function perLanguageCommands(config, p, langs, key, { intro, withCd, counts }) {
  return langs.map((l) => {
    const parts = ['<details>', `<summary><b>${langName(config, l)}</b></summary>`, '', intro, ''];
    for (const shell of SHELL_ORDER) {
      const lines = [...(withCd ? [cdInto(shell, l, 'starter')] : []), ...commandsFor(config, p, l, shell, key)];
      parts.push(`${SHELL_TITLE[shell]}:`, '', codeBlock(shell, lines), '');
    }
    if (counts) parts.push(resultLines(config, l, counts), '');
    parts.push('</details>');
    return parts.join('\n');
  }).join('\n\n');
}

function readDemoOutput(dir) {
  const f = path.join(dir, 'demo-output.txt');
  return fs.existsSync(f) ? readText(f).replace(/\n+$/, '') : '';
}

function projectReadme(config, p, dir) {
  const langs = itemLanguages(config, p);
  const r1 = roundCounts(p.rounds[0]);
  const setupFolder = config.repo.folders.setup;
  const blocks = {
    prerequisites: prerequisites(config, langs, { project: true }),
    'open-terminal': `${getTheFiles()}\n\n${openTerminal(p.slug)}`,
    'setup-check': setupCheck(config, langs, { label: `the ${setupFolder} guides`, href: `https://github.com/${config.repo.github}/tree/${config.repo.version}/${setupFolder}` }),
  };

  blocks.commands = [
    'Open the section for your language. The first line moves into your language\'s `starter` folder, which holds the code you will finish. The other lines run the tests.',
    '',
    perLanguageCommands(config, p, langs, 'round-1', { intro: 'Type or paste the lines for your system one at a time, and press Enter after each.', withCd: true, counts: r1 }),
    '',
    `**What you should see:** ${tests(r1.total)} run. ${atFirst(r1)}`,
    '',
    'That is normal. Each failing test is one piece of the task still to do, and its message says "not written yet". Your job is to make them all pass.',
    '',
    'Stay in the `starter` folder from now on: you need the `cd` line only once.',
  ].join('\n');

  blocks['how-to-read'] = HOW_TO_READ;
  blocks['open-editor'] = `Open the \`${p.slug}\` folder in your editor (in VS Code: **File**, then **Open Folder**). Your code goes in your language's \`starter\` folder.`;
  blocks.rerun = [
    'In each method, find the line that says "not written yet", replace it with your code, and save.',
    '',
    SAVE_TIP,
    '',
    `After each method, run the same test lines again. ${UP_TIP}`,
    '',
    COME_BACK,
  ].join('\n');

  p.rounds.slice(1).forEach((round, i) => {
    const r = i + 2;
    const c = roundCounts(round);
    blocks[`round-${r}`] = [
      `Round ${r}'s tests are already in your \`starter\` folder. They have their own command, so they never get in the way of round ${r - 1}. Run them from the \`starter\` folder.`,
      '',
      COME_BACK,
      '',
      perLanguageCommands(config, p, langs, `round-${r}`, { intro: 'Type or paste the lines for your system, pressing Enter after each.', withCd: false, counts: c }),
      '',
      `**What you should see:** ${tests(c.total)} run. ${atFirst(c)} ${whenDone(c)}`,
    ].join('\n');
  });

  if (p.demo !== false) {
    const expected = readDemoOutput(dir);
    blocks.demo = [
      `When every test passes${p.rounds.length > 1 ? ', in every round' : ''}, run the demo. It shows your ${p.title.replace(/ project$/i, '').toLowerCase()} working from start to end. Run it from the \`starter\` folder.`,
      '',
      COME_BACK,
      '',
      perLanguageCommands(config, p, langs, 'demo', { intro: 'Type or paste the lines for your system, pressing Enter after each.', withCd: false }),
      '',
      ...(expected ? ['**What you should see:**', '', codeBlock('', expected.split('\n'))] : []),
    ].join('\n');
  }

  blocks['solution-links'] = [
    'Finished, or stuck after all three hints? Compare with our solution for your language:',
    '',
    langs.map((l) => `- [${langName(config, l)} solution](${solutionUrl(config, p.slug, l)})`).join('\n'),
    '',
    'There is more than one good design. If your tests pass, your solution works, even if it looks different from ours.',
  ].join('\n');
  blocks.troubleshooting = troubleshooting(config, langs);
  return blocks;
}

function languageReadme(config, p, lang, dir) {
  const name = langName(config, lang);
  const r1 = roundCounts(p.rounds[0]);
  const step = (n, title, body) => [`## ${n}. ${title}`, '', body, ''].join('\n');
  const both = (key, withCd) => SHELL_ORDER.map((shell) =>
    `${SHELL_TITLE[shell]}:\n\n${codeBlock(shell, [...(withCd ? [cdInto(shell, lang, 'starter')] : []), ...commandsFor(config, p, lang, shell, key)])}`).join('\n\n');
  const parts = [
    `This page has only the ${name} commands. The task, the hints and the solution are in the [project guide](../README.md). If this is your first time, start there.`,
    '',
    getTheFiles(),
    '',
    step(1, 'Open a terminal in the project folder',
      `That is the \`${p.slug}\` folder, the one that holds this \`${lang}\` folder. Step 1 of the project guide shows how on each system.`),
    step(2, 'Check your setup',
      `${SHELL_TITLE.powershell}: \`${setupCheckLine('powershell', lang)}\`\n\n${SHELL_TITLE.bash}: \`${setupCheckLine('bash', lang)}\`\n\nIt only looks at what is installed. If it says \`[missing]\`, it tells you what to install.`),
    step(3, 'Run the tests',
      `${both('round-1', true)}\n\n${tests(r1.total)} run. ${atFirst(r1)} That is normal: each failing test is one thing still to do. ${resultLines(config, lang, r1)}`),
    step(4, 'Write the code, then run the tests again', [
      `Open the \`${p.slug}\` folder in your editor (in VS Code: **File**, then **Open Folder**).`,
      ...(() => {
        const files = filesToEdit(config, p, lang, dir);
        return files.length ? ['', `Your code goes in ${files.map((f) => `\`${lang}/starter/${f}\``).join(', ')}.`] : [];
      })(),
      '',
      `The project guide says which methods to write and in which order, with hints. In each method, replace the "not written yet" line with your code. ${SAVE_TIP}`,
      '',
      `After each method, run the test lines again (not the \`cd\` line). ${UP_TIP} Repeat until every test passes.`,
      '',
      COME_BACK.replace('step 3', 'step 3 on this page'),
    ].join('\n')),
  ];
  const comeBack = COME_BACK.replace('step 3', 'step 3 on this page');
  let n = 5;
  p.rounds.slice(1).forEach((round, i) => {
    const c = roundCounts(round);
    parts.push(step(n++, `Round ${i + 2}`, `The project guide explains the new requirement. ${comeBack} Then run:\n\n${both(`round-${i + 2}`, false)}\n\n${tests(c.total)} run. ${atFirst(c)} ${whenDone(c)} ${resultLines(config, lang, c)}`));
  });
  if (p.demo !== false) {
    const expected = readDemoOutput(dir);
    parts.push(step(n++, 'Run the demo', `When every test passes, run this from the \`starter\` folder. ${comeBack}\n\n${both('demo', false)}${expected ? `\n\nYou should see:\n\n${codeBlock('', expected.split('\n'))}` : ''}`));
  }
  return { 'language-commands': parts.join('\n').trim() };
}

// ---------- examples ----------

function exampleReadme(config, e, dir) {
  const langs = itemLanguages(config, e);
  const commands = [
    `Open a terminal in this example's folder (\`${e.slug}\`), then open the section for your language.`,
    '',
    langs.map((l) => ['<details>', `<summary><b>${langName(config, l)}</b></summary>`, '',
      ...SHELL_ORDER.flatMap((shell) => [`${SHELL_TITLE[shell]}:`, '', codeBlock(shell, [cdInto(shell, l), ...commandsFor(config, e, l, shell, 'demo')]), '']),
      '</details>'].join('\n')).join('\n\n'),
  ];
  const read = (file) => (fs.existsSync(file) ? readText(file).replace(/\n+$/, '') : '(expected-output.txt is missing)');
  const output = e.sameOutput
    ? codeBlock('', [read(path.join(dir, 'expected-output.txt'))])
    : langs.map((l) => `**${langName(config, l)}**\n\n${codeBlock('', [read(path.join(dir, l, 'expected-output.txt'))])}`).join('\n\n');
  return { commands: commands.join('\n'), output };
}

// ---------- which files get which parts ----------

/** Every README the tools manage, with the parts it must contain. Items whose JSON is missing are skipped (check reports them). */
export function plan(config) {
  const files = [
    { file: path.join(ROOT, 'README.md'), blocks: rootReadme(config) },
    { file: path.join(ROOT, config.repo.folders.setup, 'README.md'), blocks: setupReadme(config) },
    ...config.repo.languages.map((l) => ({ file: path.join(ROOT, config.repo.folders.setup, `${l}.md`), blocks: setupGuide(config, l) })),
  ];
  for (const p of listProjects(config)) {
    if (!p.data || !Array.isArray(p.data.rounds) || !p.data.rounds.length) continue;
    files.push({ file: path.join(p.dir, 'README.md'), blocks: projectReadme(config, p.data, p.dir) });
    for (const l of itemLanguages(config, p.data)) {
      if (!config.languages[l]) continue;
      files.push({ file: path.join(p.dir, l, 'README.md'), blocks: languageReadme(config, p.data, l, p.dir) });
    }
  }
  for (const e of listExamples(config)) {
    if (!e.data) continue;
    files.push({ file: path.join(e.dir, 'README.md'), blocks: exampleReadme(config, e.data, e.dir) });
  }
  return files;
}

/** Fills the parts in one file's text. Every part must have its marker, and every marker must be known. */
export function apply(text, blocks) {
  const errors = [];
  const seen = new Set();
  const out = text.replace(MARKER, (whole, name) => {
    if (!(name in blocks)) {
      errors.push(`unknown part "${name}": remove its markers, or check the project's rounds`);
      return whole;
    }
    seen.add(name);
    const body = blocks[name];
    return `<!-- generated:${name} -->\n${body ? body + '\n' : ''}<!-- /generated -->`;
  });
  for (const name of Object.keys(blocks)) {
    if (!seen.has(name)) errors.push(`missing part "${name}": add <!-- generated:${name} --> and <!-- /generated --> where it belongs`);
  }
  return { text: out, errors };
}

// ---------- whole files: the setup check scripts and the ready-made environment ----------

const shq = (s) => `'${String(s ?? '').replace(/'/g, `'\\''`)}'`;
const psq = (s) => `'${String(s ?? '').replace(/'/g, "''")}'`;

function guideUrl(config, lang) {
  const { github, version, folders } = config.repo;
  return `https://github.com/${github}/blob/${version}/${folders.setup}/${lang}.md`;
}

function setupScripts(config) {
  const dir = path.join(ROOT, 'tools', 'templates', 'setup');
  const course = (t) => t.replace(/\{\{course\}\}/g, config.repo.course);
  const bash = config.repo.languages.map((l) => {
    const d = config.languages[l];
    const fields = [l, d.name, d.detect.bash, d.detect.pattern, d.detect.min, d.tested,
      d.install.linux.command, d.install.linux.page, d.install.macos.page, guideUrl(config, l)];
    return `add_language ${fields.map(shq).join(' ')}`;
  });
  const ps = config.repo.languages.map((l) => {
    const d = config.languages[l];
    const w = d.install.windows;
    return `    @{ Id = ${psq(l)}; Name = ${psq(d.name)}; Command = ${psq(d.detect.powershell)}; Pattern = ${psq(d.detect.pattern)}; ` +
      `Min = ${psq(d.detect.min)}; Tested = ${psq(d.tested)}; Install = ${psq(w.command)}; Page = ${psq(w.page)}; ` +
      `Note = ${psq(w.note)}; Guide = ${psq(guideUrl(config, l))} }`;
  });
  return {
    sh: course(readText(path.join(dir, 'check-setup.sh'))).replace('#@LANGUAGES@', () => bash.join('\n')),
    ps1: course(readText(path.join(dir, 'check-setup.ps1'))).replace('#@LANGUAGES@', () => ps.join('\n')),
  };
}

function devcontainer(config) {
  const features = {};
  const extensions = [];
  for (const l of config.repo.languages) {
    const c = config.languages[l].container || {};
    if (c.feature) features[c.feature] = c.options || {};
    extensions.push(...(c.extensions || []));
  }
  const body = {
    name: config.repo.course,
    image: config.container.image,
    features,
    postCreateCommand: `bash ${config.repo.folders.setup}/check-setup.sh`,
    customizations: { vscode: { extensions } },
  };
  return `// Written by tools/render.mjs from repo.json and tools/languages.json: do not edit.\n${JSON.stringify(body, null, 2)}\n`;
}

// ---------- GitHub issue form: its choices follow the repo's projects, examples and languages ----------

const yq = (s) => `'${String(s).replace(/'/g, "''")}'`;

function issueForm(config) {
  const where = [
    ...listProjects(config).filter((p) => p.data).map((p) => `Project: ${p.data.title} (${p.slug})`),
    ...listExamples(config).filter((e) => e.data).map((e) => `Example: ${e.lesson} / ${e.slug}`),
    'The setup check or an install guide',
    'Something else in this repo',
  ];
  const options = (list) => list.map((o) => `        - ${yq(o)}`).join('\n');
  return `# Written by tools/render.mjs from repo.json, tools/languages.json and the projects: do not edit.
name: Problem in the code
description: A command that fails, a test that seems wrong, or a crash in a project or example.
labels: [bug]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for reporting this. Please don't include passwords or other private details.
        A problem in a lesson's text? Use the Report button on the lesson page on sevydevy.com instead.
  - type: dropdown
    id: where
    attributes:
      label: Which project or example?
      options:
${options(where)}
    validations:
      required: true
  - type: dropdown
    id: language
    attributes:
      label: Which language?
      options:
${options([...config.repo.languages.map((l) => config.languages[l].name), 'Not about one language'])}
    validations:
      required: true
  - type: dropdown
    id: system
    attributes:
      label: Which computer?
      options:
${options(['Windows', 'Mac', 'Linux', 'GitHub Codespaces'])}
    validations:
      required: true
  - type: textarea
    id: command
    attributes:
      label: The command you ran
      description: Copy it from the terminal.
      render: shell
    validations:
      required: true
  - type: textarea
    id: output
    attributes:
      label: Everything it printed
      description: Copy all of it, even if it is long.
      render: shell
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: What you expected instead
    validations:
      required: true
  - type: textarea
    id: setup
    attributes:
      label: What the setup check printed (optional)
      description: Run the setup check for your language in the project folder, as in step 2 of the project's README.
      render: shell
`;
}

function issueConfig(config) {
  return `# Written by tools/render.mjs: do not edit.
blank_issues_enabled: false
contact_links:
  - name: Problem in a lesson
    url: https://www.sevydevy.com/learn/courses
    about: Use the Report button on the lesson page.
  - name: Security problem
    url: https://github.com/${config.repo.github.split('/')[0]}/.github/blob/main/SECURITY.md
    about: Please don't report security problems in public. Follow this policy instead.
`;
}

/** Files written whole by render.mjs. Every project carries its own copy of the setup check, so its ZIP works alone. */
export function wholeFiles(config) {
  const { sh, ps1 } = setupScripts(config);
  const setup = path.join(ROOT, config.repo.folders.setup);
  const cmd = [
    '@echo off',
    'rem Setup check for Windows: runs check-setup.ps1 next to this file, for this one run only, without changing any setting.',
    'rem   check-setup.cmd          check every language',
    'rem   check-setup.cmd java     check one language',
    'rem Written by tools/render.mjs: do not edit.',
    'powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0check-setup.ps1" %*',
    '',
  ].join('\r\n');
  const scripts = (dir) => [
    { file: path.join(dir, 'check-setup.sh'), content: sh },
    { file: path.join(dir, 'check-setup.ps1'), content: ps1 },
    { file: path.join(dir, 'check-setup.cmd'), content: cmd },
  ];
  const files = [
    ...scripts(setup),
    { file: path.join(ROOT, '.devcontainer', 'devcontainer.json'), content: devcontainer(config) },
    { file: path.join(ROOT, '.github', 'ISSUE_TEMPLATE', 'code-problem.yml'), content: issueForm(config) },
    { file: path.join(ROOT, '.github', 'ISSUE_TEMPLATE', 'config.yml'), content: issueConfig(config) },
  ];
  for (const p of listProjects(config)) {
    if (p.data) files.push(...scripts(p.dir));
  }
  return files;
}

/** Renders every managed README and whole file. write=false only reports what would change. */
export function renderAll(config, { write }) {
  const changed = [];
  const errors = [];
  for (const { file, content } of wholeFiles(config)) {
    const before = fs.existsSync(file) ? readText(file) : null;
    if (before !== content.replace(/\r\n/g, '\n')) {
      changed.push(rel(file));
      if (write) {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, content);
      }
    }
  }
  for (const { file, blocks } of plan(config)) {
    if (!fs.existsSync(file)) {
      errors.push(`${rel(file)}: file is missing`);
      continue;
    }
    const before = readText(file);
    const { text, errors: errs } = apply(before, blocks);
    errs.forEach((e) => errors.push(`${rel(file)}: ${e}`));
    if (text !== before) {
      changed.push(rel(file));
      if (write) fs.writeFileSync(file, text);
    }
  }
  return { changed, errors };
}
