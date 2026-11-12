# Low-Level Design: course code

The code for SevyDevy's Low-Level Design course. You practise designing classes by building small, working programs, and tests tell you when your code is right.

The lessons are on [sevydevy.com](https://www.sevydevy.com/learn/courses). This page holds only the code.

## Before you start

<!-- generated:prerequisites -->
You need three things:

1. **One programming language** from this list. You need only one, so pick the one you know best. Newer versions usually work too.

| Language | Version we test with |
|---|---|
| C++ | g++ with C++17 |
| Java | JDK 21 |
| JavaScript | Node.js 22 |
| Python | Python 3.12 |

2. **A code editor** to change the files. Any editor works. [VS Code](https://code.visualstudio.com/) is free and runs on Windows, Mac and Linux.
3. **A terminal**: the window where you type commands. Every computer already has one.

You don't need git, a GitHub account or any other tool. Each project carries everything else it needs.

You should already know the basics of your language: how to write a class, a method and a loop.
<!-- /generated -->

## Get a project

Each machine-coding lesson has a project card with two buttons. You need only one of them:

- **Download project** (easiest): downloads one ZIP file with that project, ready to use on your computer.
- **Open on GitHub**: shows the same project here, in your language's folder, so you can read its guide in your web browser.

Most people do both: download the project, and keep its guide open on GitHub to read. The guide is the project's `README.md` file. It walks you through the same steps every time: open a terminal, check your setup, run the tests, and write the code. You never need the rest of this page to do a project.

**Reading the guide on your computer instead?** A `.md` file opened in Notepad or TextEdit shows plain text with symbols in it. Open the project folder in VS Code instead, click `README.md`, and press Ctrl+Shift+V (Cmd+Shift+V on a Mac) to see it laid out properly.

### Already use git?

Copy the whole course with one command:

<!-- generated:clone -->
```bash
git clone https://github.com/sevydevy-hq/low-level-design.git
```
<!-- /generated -->

Then open the project you want in the `projects` folder and follow its README. Solutions are kept apart from the starters, so you never see one by accident.

### Don't want to install anything?

<!-- generated:codespaces -->
[Open this repo in GitHub Codespaces](https://codespaces.new/sevydevy-hq/low-level-design?quickstart=1)
<!-- /generated -->

That opens an editor in your web browser with every language already installed, so you can skip the setup. You need a free GitHub account. It uses your account's free monthly Codespaces time, and GitHub shows how much is left. The first start takes a few minutes.

## Words you will see

| Word | What it means |
|---|---|
| Terminal | The window where you type commands. On Windows it is called Terminal or PowerShell; on a Mac and on Linux, Terminal. |
| Command | A line you type into the terminal and run by pressing Enter. |
| Folder | Also called a directory. The command `cd` ("change directory") moves the terminal into a folder. |
| Starter | The code you start from. Some methods are left for you to write. |
| Test | A small program that checks one thing your code should do. Each test passes or fails. |
| Round | A part of a project. Round 2 adds a new requirement after round 1 works, as real interviews do. |
| Solution | Our finished version. Each project's README links to it at the end. |
| Repo | Short for repository: a folder of code kept on GitHub, like this one. |
| ZIP | One file that holds a whole folder. Extract it to get the folder back. |

## What is here

| Folder | What it holds |
|---|---|
| `projects/` | One folder per machine-coding project, each with its own README and a folder per language. |
| `examples/` | The full code behind each example in the lessons, in every language. |
| `setup/` | How to install each language, step by step. |

## Found a problem?

- **In the code** (a command that fails, a test that seems wrong): open an issue on GitHub. Say which project and language, the command you ran, and everything it printed.
- **In a lesson:** use the Report button on the lesson page.

Fixes are welcome as pull requests. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

The code is under the [MIT licence](LICENSE): you may use, change and share it, including in your own portfolio. The lesson text on sevydevy.com is not part of this repo.
