# Install JavaScript

<!-- generated:tested-version -->
Version we test with: **Node.js 22**. Newer versions usually work too.
<!-- /generated -->

This guide installs Node.js, which runs JavaScript outside the web browser. It takes about 10 minutes. You need it only if the setup check said `[missing]` or `[old]`.

## Is it already installed?

<!-- generated:version-check -->
Open a terminal in your project's folder (step 1 of the project's README shows how). Then run the setup check:

- Windows: `.\check-setup.cmd javascript`
- Mac and Linux: `bash check-setup.sh javascript`

If it says `[ok]`, JavaScript is ready and you can skip this guide. Without a project, you can also type `node --version`: if it prints a version number, it is installed.
<!-- /generated -->

## Install it

Follow the steps for your computer.

<!-- generated:install -->
### Windows

1. Open a terminal: right-click the Start button and choose **Terminal** (on Windows 10, open the Start menu, type `powershell` and press Enter).
2. Copy this command into the terminal and press Enter. If it asks you to agree to terms, type `Y` and press Enter. If Windows asks for permission, choose **Yes**.

```powershell
winget install -e --id OpenJS.NodeJS.22
```

   If the terminal says `winget` is not recognized, download the installer from https://nodejs.org/en/download instead and follow its steps.
3. Close the terminal when it finishes.

### Linux (Ubuntu or Debian)

1. Follow the Linux steps on https://nodejs.org/en/download.
2. Close the terminal when it finishes.

### Mac

1. Follow the steps on https://nodejs.org/en/download.
2. Close the Terminal app when it finishes.
<!-- /generated -->

## Check that it worked

Open a new terminal **in your project's folder**. Step 1 of the project's README shows how. Then run the setup check again, as in "Is it already installed?" above. When it says `[ok]`, you are ready: go back to your project's README and continue from step 3.

## If something goes wrong

<details>
<summary><b>Linux: node --version shows v18 or older</b></summary>

Ubuntu's own package is older than the version we test with. Use the Linux steps on the Node.js download page above instead.

</details>

<details>
<summary><b>node is "not recognized" after installing</b></summary>

Close every terminal window and open a new one, then run the setup check again.

</details>

Still stuck? Open an issue on GitHub. Say which system you use, and paste everything the setup check printed.
