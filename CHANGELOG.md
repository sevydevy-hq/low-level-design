# Changelog

Each release lists what changed, by project and example. Before a course moves to a new version, every lesson that uses a changed project or example is re-checked.

Format for each release: the version and date, then **Added**, **Changed** and **Fixed**, each naming the project or example folder and, for changes, the languages.

## Unreleased

### Added

- Repo structure: `repo.json`, `tools/languages.json`, schemas, templates and the rules in `docs/STRUCTURE.md`. No projects or examples yet.
- Maintainer tools: `tools/new-project.mjs`, `tools/render.mjs`, `tools/check.mjs`, and the Java and C++ test runners.
- Beginner guides: every project README is a numbered walk-through (what you need, open a terminal, check your setup, run the tests, write the code, round 2, help), the front page explains the words readers meet, and each language has a full install guide. `check.mjs` keeps every reader page in plain language.
- An issue form for problems in the code, whose project and language choices follow the repo.
- Releases: `tools/release.mjs` (one ZIP per project) and GitHub workflows that check every change on Linux, Windows and macOS, publish tagged releases, and rebuild the ready-made environment.
- Setup check for readers (`check-setup.sh`; on Windows `check-setup.cmd`, which runs `check-setup.ps1`) in `setup/` and in every project, and a ready-made environment for GitHub Codespaces and VS Code (`.devcontainer/`).
