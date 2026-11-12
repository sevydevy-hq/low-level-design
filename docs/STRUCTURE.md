# How this repo is built

For maintainers. This is the contract between the course, this repo and the tools. Decided on 12 Nov 2026; the full reasoning is in the course team's code-delivery decisions.

## 1. What the repo is

- One public repo per course. This one is the Low-Level Design course's.
- It holds only code: projects, examples, setup guides and the tools that check them. Lesson text stays on sevydevy.com.
- The local clone is the only place course code is written. Lessons quote files from it; nothing is copied by hand.

## 2. The design rule: every fact lives in one place

Anything that may change later is written once, and everything else reads it from there.

| Fact | Its one home | Read by |
|---|---|---|
| Repo name, current version, branch names, folders, which languages the course uses | `repo.json` | tools, generated README parts, release links |
| Each language's name, tested version, version check, file names and default commands | `tools/languages.json` | tools, generated README parts, the GitHub check matrix |
| How to detect each language, its install command or page per system, and how the ready-made environment gets it | `tools/languages.json` (`detect`, `install`, `container`) | the setup check scripts, `.devcontainer/devcontainer.json` |
| A project's title, lessons, extra source files and test names per round | `projects/<project>/project.json` | tools, generated README parts |
| An example's lessons and output rule | `examples/<lesson>/<example>/example.json` | tools, generated README parts |
| The shape of those files | `tools/schema/*.schema.json` | editors (as you type) and `check.mjs` |

So a change is one edit:

| Change | Edit |
|---|---|
| Release `v1.1` | `version` in `repo.json` |
| New JDK, Node.js or Python version | that language's `version` in `tools/languages.json` (the READMEs, setup check, container and GitHub checks all follow) |
| A new language | one entry in `tools/languages.json`, its id in `repo.json`, then its files in each project |
| A different compiler flag | the default command in `tools/languages.json` |
| Repo renamed or moved | `github` in `repo.json` |
| Same tools for the DSA repo | copy `tools/`; write that repo's own `repo.json` |

The tools never contain a course name, repo name, version or language list of their own.

## 3. Generated README parts

README text that comes from the files above sits between markers:

```
<!-- generated:commands -->
…written by tools/render.mjs…
<!-- /generated -->
```

- Never edit inside the markers. Change the source file and run `tools/render.mjs`.
- Everything outside the markers (the task, the hints, the explanations) is written by hand and never touched by the tools.
- `check.mjs` fails if any generated part is out of date. A README can never show a command we did not run, or an old version link.

Some files are written whole by `render.mjs`, never by hand:

| File | From |
|---|---|
| `setup/check-setup.sh`, `.ps1` and `.cmd` (the Windows one-word runner), and a copy of all three in every project | `tools/templates/setup/` plus each language's `detect` and `install` |
| `.devcontainer/devcontainer.json` | the `container` parts of `tools/languages.json` |

The setup check only runs version commands. It never installs anything: it prints the one install command or page for the reader's system. The ready-made environment (GitHub Codespaces, or VS Code's "Reopen in Container") has every course language installed and runs the setup check when it starts.

Marker names in use: `prerequisites`, `clone`, `codespaces` (root README); `setup-guides`, `setup-check` (setup/README.md); `tested-version`, `version-check`, `install` (each setup guide); `prerequisites`, `open-terminal`, `setup-check`, `commands`, `rerun`, `round-2` (and `round-3`…), `solution-links`, `troubleshooting` (project README); `language-commands` (language README); `commands`, `output` (example README).

**Written for beginners.** Every reader page follows one rule: open a terminal in the project folder, then follow numbered steps. Commands are given in full for Windows and for Mac and Linux, with nothing to replace, and each step says what the reader should see. Hand-written parts follow the same style: short sentences, one idea each, and no word a beginner would not know. `check.mjs` enforces the plain-language rules (section 10).

## 4. Folder map

```
low-level-design/
├── README.md, CHANGELOG.md, LICENSE, CONTRIBUTING.md
├── repo.json                       repo-wide values
├── .gitignore, .gitattributes, .editorconfig
├── .github/workflows/              check, release and container workflows
├── .devcontainer/devcontainer.json the ready-made environment (written by render.mjs)
├── docs/STRUCTURE.md               this file
├── setup/                          one install guide per language
├── projects/<project>/             machine-coding projects
├── examples/<lesson>/<example>/    the code behind lesson examples
└── tools/
    ├── languages.json              every language the repos can use
    ├── schema/                     JSON schemas for the four JSON files
    ├── templates/                  starting files for a project or an example
    ├── runners/                    master copies of the Java and C++ test runners
    └── *.mjs                       (later) new-project, render, check, release
```

Top-level folders exist only when `repo.json` lists them. A DSA repo would use `problems/` in place of `projects/`.

## 5. Naming rules

- **Project, lesson and example folders:** lowercase with hyphens: `parking-lot`, `what-is-the-strategy-pattern`. A folder name is an id: chosen once, when the course design names it.
- **Language folders:** the ids in `tools/languages.json`: `cpp`, `java`, `javascript`, `python`.
- **Never rename or move a folder after it is released.** Old lesson links point at it. If a lesson is renamed later, its example folder keeps the old name; `example.json` lists the lessons.
- **File names come from `tools/languages.json`**, using the project slug. For `parking-lot`:

| | C++ | Java | JavaScript | Python |
|---|---|---|---|---|
| Round 1 tests | `test.cpp` | `ParkingLotTest.java` | `parking-lot.test.js` | `test_parking_lot.py` |
| Round n tests | `test_round2.cpp` | `ParkingLotRound2Test.java` | `parking-lot.round2.test.js` | `test_parking_lot_round2.py` |
| Demo | `main.cpp` | `Main.java` | `main.js` | `main.py` |
| Other code | listed in `sources` | one file per class | free | free |

- **Test names are the same in every language**, compared ignoring case, spaces, `_` and `-`: `canFitSmallerVehicle`, `can_fit_smaller_vehicle` and "can fit smaller vehicle" are one test.
- Test commands always name the test file. A bare `node --test` or `python -m unittest` would run every round at once.

**Writing tests so the tools can read them:**

| Language | How |
|---|---|
| C++ | `TEST("name") { … }` from `test_runner.hpp`; `int main() { return test_runner::run_all(); }` in each test file. |
| Java | `TestRunner t = new TestRunner(); t.test("name", () -> …); System.exit(t.run());` in each test class. |
| JavaScript | `test('name', () => …)` from `node:test`, at the top level (no `describe`). |
| Python | `unittest.TestCase` methods named `test_<name>`, without docstrings (a docstring changes the line `-v` prints). |

A starter's unfinished method throws "… is not written yet" (`std::runtime_error`, `UnsupportedOperationException`, `Error`, `NotImplementedError`). A test that expects an exception must check its type, so the "not written yet" throw does not pass it by accident.

## 6. Projects

```
projects/<project>/
├── README.md          task, setup check, commands, later rounds, hints, solution links
├── project.json       only what is specific to this project
├── demo-output.txt    what the finished demo prints
├── check-setup.sh, .ps1, .cmd   the setup check (written by render.mjs), so the ZIP works alone
└── <language>/
    ├── README.md      setup check and that language's commands only (GitHub shows it on "Open on GitHub"); fully generated
    ├── demo-output.txt   only if this language prints something different
    ├── starter/       main branch: code to finish, tests, runner copy
    └── solution/      solutions branch only: the same files, finished
```

**`project.json`** (schema: `tools/schema/project.schema.json`; template: `tools/templates/project/`):

| Field | Meaning |
|---|---|
| `slug` | The folder name. Also the ZIP name: `<slug>.zip`. |
| `title` | The name on the lesson's project card. |
| `lessons` | Every lesson that uses it. |
| `since` | The first release that has it. |
| `languages` | Only if the project leaves out a course language, which the lesson must say. Default: all of `repo.json`. |
| `sources` | Extra files a language's commands must name, such as the `.cpp` files for g++. |
| `rounds` | Round 1 first, then any later rounds. Each lists its `tests` by name and the `starterPasses`. The starter must fail every other test; the solution must pass all. |
| `demo` | `false` if there is no demo program. |
| `overrides` | Only when a command really differs from the language default. |

Commands are not written in `project.json`. They come from `tools/languages.json` with the project's names filled in.

## 7. Examples

```
examples/<lesson>/<example>/
├── README.md
├── example.json            lessons, sources, "sameOutput"
├── expected-output.txt     when every language prints the same
└── <language>/             the files; plus expected-output.txt when "sameOutput" is false
```

Examples live on `main` only. They run with the language's `demo` command. They have no starter and no hidden solution, because the lesson already shows the code. A concept module's "Build it yourself" answer is an example too; the lesson keeps it in a fold.

## 8. Branches

| Branch | Holds |
|---|---|
| `main` | Everything except `solution/` folders. This is what readers download and clone by default. |
| `solutions` | `main` plus every `solution/` folder. |

- Every change outside a `solution/` folder is made on `main` first, then `main` is merged into `solutions`. Never the other way.
- Changes to a solution are made on `solutions` only.
- The checks fail if `main` has a `solution/` folder, or if `solutions` differs from `main` outside `solution/` folders.

## 9. Versions and releases

- A release tags both branches: the version on `main` (`v1.0`) and the version plus `solutionsTagSuffix` on `solutions` (`v1.0-solutions`).
- `v1.1` for fixes, `v2.0` for big changes.
- Releasing, in this order:
  1. On `main`: set `version` in `repo.json`, run `render.mjs` (it updates every solution link), rename `## Unreleased` in `CHANGELOG.md` to `## v1.0 (date)`, run `check.mjs`, commit.
  2. Merge `main` into `solutions`. Tag `solutions` with `v1.0-solutions` and push it.
  3. Tag `main` with `v1.0` and push it. That starts `.github/workflows/release.yml`.
- The release workflow runs the full check on all three systems, confirms `v1.0` is on `main` and `v1.0-solutions` is on `solutions`, runs `tools/release.mjs`, and publishes a GitHub release with the ZIPs, `SHA256SUMS.txt` and the CHANGELOG section as its notes. Any failure stops it before anything is published.
- `tools/release.mjs` builds one ZIP per project from `main` at the tag, and refuses on any other branch or when the tag and `repo.json` disagree. The same files always give byte-identical ZIPs. Each ZIP opens into one `<slug>/` folder holding the project README, `demo-output.txt`, the setup check scripts, and every language's README and `starter/`. It leaves out `project.json`, which readers do not need.
- The course file holds `companionRepo` and `companionVersion`. The lesson's links are built from them:

| Link | Points to |
|---|---|
| Download project | `github.com/<github>/releases/download/<version>/<slug>.zip` |
| Open on GitHub | `github.com/<github>/tree/<version>/projects/<slug>/<reader's language>` |
| Solution (README only) | `github.com/<github>/tree/<version>-solutions/projects/<slug>/<lang>/solution` |

A code fix reaches readers when we release, change `companionVersion` and re-import the course. The changelog says which lessons to re-check first.

## 10. Checks

`tools/check.mjs` runs here before every push, and on GitHub on Linux, Windows and macOS for every change and release. The GitHub matrix reads its languages and versions from `check.mjs --matrix`, so the workflow never changes when a language or version does.

| Workflow | When | What |
|---|---|---|
| `.github/workflows/check.yml` | every push and pull request to `main` or `solutions` | files and rules once, then one job per system and language: the reader's setup check, then every project and example (PowerShell 5.1 on Windows, bash elsewhere) |
| `.github/workflows/release.yml` | a `v1.0`-style tag | the check above, both tags, ZIPs, the GitHub release |
| `.github/workflows/container.yml` | changes to the environment's inputs, monthly, on demand | builds `.devcontainer`, runs the setup check and the full check inside it |

1. `repo.json`, `tools/languages.json`, every `project.json` and every `example.json` match their schemas, and every language in `repo.json` exists in `tools/languages.json`.
2. Every folder and file they name exists, and no project or example folder lacks its JSON file.
3. On `main`, each starter passes exactly `starterPasses` and fails every other test, in every round and language.
4. On `solutions`, each solution passes every test of every round, in every language.
5. Each solution's demo prints its `demo-output.txt`; each example prints its expected output.
6. Every generated README part is up to date.
7. Every runner copy matches `tools/runners/`.
8. Branch rules hold (section 8).
9. Every page a reader sees is in plain language: sentences of at most 25 words, no talking-down words ("simply", "just", "easy"…), and on the beginner pages (project, language, setup and example pages) no unexplained technical words ("repository", "branch", "compiler"…). The lists are in `tools/lib/plain.mjs`.

A release happens only when all of them pass. Before a release, the course team's own checker also confirms that every lesson excerpt matches its file here at that version.

## 11. Adding a project

1. The course design names the project and its lesson. Nothing is added before that.
2. On `main`, run `tools/new-project.mjs <slug>`. It makes the folders, fills the templates and copies the runners.
3. Write the starter and the tests in every language; fill `project.json` and the hand-written README parts.
4. Run `tools/render.mjs`, then `tools/check.mjs`, and commit.
5. Merge `main` into `solutions`, write the solutions there, run the check again and commit.
6. Add it under "Unreleased" in `CHANGELOG.md`. It ships in the next release.

## 12. Never in this repo

Lesson text or drafts; solutions on `main`; build output; packages to install; secrets or personal data.
