# Tools

For maintainers. Readers never need anything in this folder. The rules these tools enforce are in [docs/STRUCTURE.md](../docs/STRUCTURE.md).

| Path | What it is | Status |
|---|---|---|
| `languages.json` | Every language the repos can use: name, tested version, version check, file names, default commands. | Ready |
| `schema/` | JSON schemas for `repo.json`, `languages.json`, `project.json` and `example.json`. | Ready |
| `templates/` | Starting files for a new project or example, and the setup check scripts' logic (`templates/setup/`). | Ready |
| `runners/` | The master copy of the small Java and C++ test runners. Each project carries its own copy, so a downloaded ZIP works on its own. | Ready |
| `new-project.mjs` | Makes a new project from the template. | Ready |
| `render.mjs` | Writes every generated README part, the setup check scripts and `.devcontainer/devcontainer.json`. | Ready |
| `check.mjs` | Runs every check in STRUCTURE.md section 10. GitHub runs the same script. | Ready |
| `release.mjs` | Builds one ZIP per project from `main`, plus `SHA256SUMS.txt` and the release notes from `CHANGELOG.md`, into `dist/<version>/`. GitHub's release workflow runs it on a version tag. | Ready |
| `lib/` | Code the scripts share, including a small ZIP writer. | Ready |

## Using them

Run from the repo's top folder. They are plain Node.js 22 scripts with no packages to install.

```bash
# start a project (on main)
node tools/new-project.mjs parking-lot --title "Parking lot project" --lesson parking-lot-machine-coding

# after changing repo.json, languages.json or any project.json / example.json
node tools/render.mjs

# before every commit
node tools/check.mjs                      # everything, in this machine's shell
node tools/check.mjs --static             # files and rules only, no code run
node tools/check.mjs --project parking-lot --lang java,python

# try a release locally (GitHub does the real one from a tag)
node tools/release.mjs
```

On Windows, `check.mjs` runs the PowerShell commands. To run the bash commands too, use WSL: `node tools/check.mjs --shell bash --via wsl --lang cpp,python` (only the languages installed in WSL). GitHub runs both shells on Linux, Windows and macOS.

Every run copies each starter, solution and example to `.check/` first, so nothing is ever built inside the repo's own folders.

The tools read every name, version and language from `repo.json` and `languages.json`, so the same tools work unchanged in another course's repo.
