# Install Java

<!-- generated:tested-version -->
Version we test with: **JDK 21**. Newer versions usually work too.
<!-- /generated -->

This guide installs the Java Development Kit (JDK), which includes `javac` to build your code and `java` to run it. It takes about 10 minutes. You need it only if the setup check said `[missing]` or `[old]`.

## Is it already installed?

<!-- generated:version-check -->
Open a terminal in your project's folder (step 1 of the project's README shows how). Then run the setup check:

- Windows: `.\check-setup.cmd java`
- Mac and Linux: `bash check-setup.sh java`

If it says `[ok]`, Java is ready and you can skip this guide. Without a project, you can also type `javac -version`: if it prints a version number, it is installed.
<!-- /generated -->

## Install it

Follow the steps for your computer.

<!-- generated:install -->
### Windows

1. Open a terminal: right-click the Start button and choose **Terminal** (on Windows 10, open the Start menu, type `powershell` and press Enter).
2. Copy this command into the terminal and press Enter. If it asks you to agree to terms, type `Y` and press Enter. If Windows asks for permission, choose **Yes**.

```powershell
winget install -e --id EclipseAdoptium.Temurin.21.JDK
```

   If the terminal says `winget` is not recognized, download the installer from https://adoptium.net/temurin/releases/?version=21 instead and follow its steps.
3. Close the terminal when it finishes.

### Linux (Ubuntu or Debian)

1. Open a terminal.
2. Copy this command into the terminal and press Enter. It asks for your password; the password does not show as you type.

```bash
sudo apt install -y openjdk-21-jdk
```

3. Close the terminal when it finishes.

On other Linux systems, see https://adoptium.net/installation/linux/.

### Mac

1. Follow the steps on https://adoptium.net/temurin/releases/?version=21.
2. Close the Terminal app when it finishes.
<!-- /generated -->

## Check that it worked

Open a new terminal **in your project's folder**. Step 1 of the project's README shows how. Then run the setup check again, as in "Is it already installed?" above. When it says `[ok]`, you are ready: go back to your project's README and continue from step 3.

## If something goes wrong

<details>
<summary><b>java works, but javac is "not recognized" or "not found"</b></summary>

You have only the part of Java that runs programs, not the part that builds them. Install the JDK with the steps above: it includes both.

</details>

<details>
<summary><b>The setup check says [old]</b></summary>

You have an older Java (Java 8 shows as version 1.8). Most things still work. If a command fails, install the version above. You can keep the old one; the newest install is usually the one the terminal finds.

</details>

Still stuck? Open an issue on GitHub. Say which system you use, and paste everything the setup check printed.
