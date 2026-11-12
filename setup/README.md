# Setup

You need one programming language on your computer. This page helps you pick one, check whether you already have it, and install it if not.

<!-- Maintainers: the generated parts come from tools/languages.json. Before each release, run every install step in these guides on a clean Windows and a clean Ubuntu machine. -->

## 1. Pick one language

Pick the one you know best. You need only one.

<!-- generated:setup-guides -->
| Language | Guide | Version we test with |
|---|---|---|
| C++ | [Install C++](cpp.md) | g++ with C++17 |
| Java | [Install Java](java.md) | JDK 21 |
| JavaScript | [Install JavaScript](javascript.md) | Node.js 22 |
| Python | [Install Python](python.md) | Python 3.12 |
<!-- /generated -->

## 2. Check whether you already have it

Open a terminal in this `setup` folder, or in any project's folder. Then run the setup check:

<!-- generated:setup-check -->
Run the setup check for your language. It only looks at what is installed; it never installs or changes anything.

| Language | Windows | Mac and Linux |
|---|---|---|
| C++ | `.\check-setup.cmd cpp` | `bash check-setup.sh cpp` |
| Java | `.\check-setup.cmd java` | `bash check-setup.sh java` |
| JavaScript | `.\check-setup.cmd javascript` | `bash check-setup.sh javascript` |
| Python | `.\check-setup.cmd python` | `bash check-setup.sh python` |

Copy the command from your row, paste it into the terminal and press Enter. You will see one of three results:

- `[ok]`: you are ready. Go to the next step.
- `[old]`: your version is older than the one we test with. Most things still work. If a command fails later, update it.
- `[missing]`: the check prints how to install it (a command, a web page, or both). Install it, close the terminal, open a new one in the same folder, and run the check again.
<!-- /generated -->

## 3. Install it, if the check says [missing]

Open the guide for your language from the table in step 1. Each guide takes about 10 minutes and ends by running the check again.

## Or skip installing

Open the course in GitHub Codespaces instead. The link is on the [front page](../README.md#dont-want-to-install-anything). It gives you an editor in your web browser with every language already installed. You need a free GitHub account.
