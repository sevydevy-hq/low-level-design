# Install Python

<!-- generated:tested-version -->
Version we test with: **Python 3.12**. Newer versions usually work too.
<!-- /generated -->

This guide installs Python itself, which runs your Python files. It takes about 10 minutes. You need it only if the setup check said `[missing]` or `[old]`.

## Is it already installed?

<!-- generated:version-check -->
Open a terminal in your project's folder (step 1 of the project's README shows how). Then run the setup check:

- Windows: `.\check-setup.cmd python`
- Mac and Linux: `bash check-setup.sh python`

If it says `[ok]`, Python is ready and you can skip this guide. Without a project, you can also type `python3 --version` (Windows: `python --version`): if it prints a version number, it is installed.
<!-- /generated -->

## Install it

Follow the steps for your computer.

<!-- generated:install -->
### Windows

1. Open a terminal: right-click the Start button and choose **Terminal** (on Windows 10, open the Start menu, type `powershell` and press Enter).
2. Copy this command into the terminal and press Enter. If it asks you to agree to terms, type `Y` and press Enter. If Windows asks for permission, choose **Yes**.

```powershell
winget install -e --id Python.Python.3.12
```

   If the terminal says `winget` is not recognized, download the installer from https://www.python.org/downloads/windows/ instead and follow its steps.

   If typing python opens the Microsoft Store, install Python from python.org instead and tick "Add python.exe to PATH".
3. Close the terminal when it finishes.

### Linux (Ubuntu or Debian)

1. Open a terminal.
2. Copy this command into the terminal and press Enter. It asks for your password; the password does not show as you type.

```bash
sudo apt install -y python3
```

3. Close the terminal when it finishes.

On other Linux systems, see https://www.python.org/downloads/.

### Mac

1. Follow the steps on https://www.python.org/downloads/macos/.
2. Close the Terminal app when it finishes.
<!-- /generated -->

## Check that it worked

Open a new terminal **in your project's folder**. Step 1 of the project's README shows how. Then run the setup check again, as in "Is it already installed?" above. When it says `[ok]`, you are ready: go back to your project's README and continue from step 3.

## If something goes wrong

<details>
<summary><b>Windows: typing python opens the Microsoft Store</b></summary>

Windows has a shortcut that opens the Store instead of Python. Install Python from python.org, and on the first screen of the installer tick **Add python.exe to PATH**. Then open a new terminal.

</details>

<details>
<summary><b>Mac or Linux: python is not found, but python3 is</b></summary>

That is normal. On a Mac and on Linux the command is `python3`, and every command in this course for those systems already uses it.

</details>

<details>
<summary><b>Mac: running the check opens a window asking to install developer tools</b></summary>

On some Macs, `python3` offers to install Apple's command line developer tools first. You can click **Install**, which gives you an older Python, or click **Cancel** and install the version above from python.org.

</details>

<details>
<summary><b>Mac: the setup check says [old] (for example 3.9)</b></summary>

The Python that came with your Mac is older. Most things still work. If a command fails, install the version above from python.org; a new Terminal window then uses it.

</details>

Still stuck? Open an issue on GitHub. Say which system you use, and paste everything the setup check printed.
