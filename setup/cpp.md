# Install C++

<!-- generated:tested-version -->
Version we test with: **g++ with C++17**. Newer versions usually work too.
<!-- /generated -->

This guide installs g++, the tool that turns your C++ files into a program you can run. It takes about 10 minutes. You need it only if the setup check said `[missing]` or `[old]`.

## Is it already installed?

<!-- generated:version-check -->
Open a terminal in your project's folder (step 1 of the project's README shows how). Then run the setup check:

- Windows: `.\check-setup.cmd cpp`
- Mac and Linux: `bash check-setup.sh cpp`

If it says `[ok]`, C++ is ready and you can skip this guide. Without a project, you can also type `g++ --version`: if it prints a version number, it is installed.
<!-- /generated -->

## Install it

Follow the steps for your computer.

<!-- generated:install -->
### Windows

1. Open a terminal: right-click the Start button and choose **Terminal** (on Windows 10, open the Start menu, type `powershell` and press Enter).
2. Copy this command into the terminal and press Enter. If it asks you to agree to terms, type `Y` and press Enter. If Windows asks for permission, choose **Yes**.

```powershell
winget install -e --id BrechtSanders.WinLibs.POSIX.UCRT
```

   If the terminal says `winget` is not recognized, download the installer from https://winlibs.com/ instead and follow its steps.
3. Close the terminal when it finishes.

### Linux (Ubuntu or Debian)

1. Open a terminal.
2. Copy this command into the terminal and press Enter. It asks for your password; the password does not show as you type.

```bash
sudo apt install -y g++
```

3. Close the terminal when it finishes.

On other Linux systems, see https://gcc.gnu.org/install/binaries.html.

### Mac

1. Follow the steps on https://developer.apple.com/xcode/resources/.
2. Close the Terminal app when it finishes.
<!-- /generated -->

## Check that it worked

Open a new terminal **in your project's folder**. Step 1 of the project's README shows how. Then run the setup check again, as in "Is it already installed?" above. When it says `[ok]`, you are ready: go back to your project's README and continue from step 3.

## If something goes wrong

<details>
<summary><b>Mac: typing g++ opens a window asking to install tools</b></summary>

That is Apple's own installer for the command line developer tools, which include g++. Click **Install**, wait for it to finish, then open a new Terminal window and run the setup check again.

</details>

<details>
<summary><b>Mac: g++ --version says "Apple clang"</b></summary>

That is fine. On a Mac, `g++` is Apple's clang, and every command in this course works with it.

</details>

<details>
<summary><b>Windows: g++ is still "not recognized" after installing</b></summary>

Close every terminal window and open a new one. If it is still not found, restart your computer and try again. If that does not help, open an issue on GitHub with what the setup check printed.

</details>

Still stuck? Open an issue on GitHub. Say which system you use, and paste everything the setup check printed.
