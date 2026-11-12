#!/usr/bin/env bash
# Setup check for the Low-Level Design course.
# It only runs each language's version command. It installs nothing and changes nothing.
#
#   bash check-setup.sh          check every language (you need only one)
#   bash check-setup.sh java     check one language: cpp, java, javascript or python
#
# Written by tools/render.mjs from tools/languages.json and tools/templates/setup/check-setup.sh: do not edit.

IDS=(); NAMES=(); CMDS=(); PATS=(); MINS=(); TESTED=(); LINUX_CMD=(); LINUX_PAGE=(); MAC_PAGE=(); GUIDE=()
add_language() {
  IDS+=("$1"); NAMES+=("$2"); CMDS+=("$3"); PATS+=("$4"); MINS+=("$5"); TESTED+=("$6")
  LINUX_CMD+=("$7"); LINUX_PAGE+=("$8"); MAC_PAGE+=("$9"); GUIDE+=("${10}")
}

add_language 'cpp' 'C++' 'g++ --version' '[ )]([0-9]+)\.[0-9]+\.[0-9]+' '9' 'g++ with C++17' 'sudo apt install -y g++' 'https://gcc.gnu.org/install/binaries.html' 'https://developer.apple.com/xcode/resources/' 'https://github.com/sevydevy-hq/low-level-design/blob/v1.0/setup/cpp.md'
add_language 'java' 'Java' 'javac -version' 'javac (1\.[0-9]+|[0-9]+)' '21' 'JDK 21' 'sudo apt install -y openjdk-21-jdk' 'https://adoptium.net/installation/linux/' 'https://adoptium.net/temurin/releases/?version=21' 'https://github.com/sevydevy-hq/low-level-design/blob/v1.0/setup/java.md'
add_language 'javascript' 'JavaScript' 'node --version' 'v([0-9]+)\.' '22' 'Node.js 22' '' 'https://nodejs.org/en/download' 'https://nodejs.org/en/download' 'https://github.com/sevydevy-hq/low-level-design/blob/v1.0/setup/javascript.md'
add_language 'python' 'Python' 'python3 --version' 'Python ([0-9]+\.[0-9]+)' '3.12' 'Python 3.12' 'sudo apt install -y python3' 'https://www.python.org/downloads/' 'https://www.python.org/downloads/macos/' 'https://github.com/sevydevy-hq/low-level-design/blob/v1.0/setup/python.md'

# True when version $1 is at least $2 (versions like 21 or 3.12).
version_at_least() {
  local a_major=${1%%.*} b_major=${2%%.*} a_minor=0 b_minor=0
  case "$1" in *.*) a_minor=${1#*.}; a_minor=${a_minor%%.*} ;; esac
  case "$2" in *.*) b_minor=${2#*.}; b_minor=${b_minor%%.*} ;; esac
  [ "$a_major" -gt "$b_major" ] || { [ "$a_major" -eq "$b_major" ] && [ "$a_minor" -ge "$b_minor" ]; }
}

os=linux
[ "$(uname -s)" = "Darwin" ] && os=macos

wanted="$1"
if [ -n "$wanted" ]; then
  known=no
  for id in "${IDS[@]}"; do [ "$id" = "$wanted" ] && known=yes; done
  if [ "$known" = no ]; then
    echo "Unknown language \"$wanted\". Use one of: ${IDS[*]}"
    exit 2
  fi
fi

echo "Checking your setup. This only reads versions; it installs and changes nothing."
echo
ready=0
missing=0
for i in "${!IDS[@]}"; do
  [ -n "$wanted" ] && [ "${IDS[$i]}" != "$wanted" ] && continue
  out=$(${CMDS[$i]} 2>&1 | head -n 5)
  version=$(printf '%s\n' "$out" | sed -n -E "s/.*${PATS[$i]}.*/\\1/p" | head -n 1)
  if [ -z "$version" ]; then
    missing=$((missing + 1))
    echo "  [missing] ${NAMES[$i]}: \"${CMDS[$i]}\" did not print a version."
    if [ "$os" = linux ] && [ -n "${LINUX_CMD[$i]}" ]; then
      echo "            Install it with: ${LINUX_CMD[$i]}"
    elif [ "$os" = linux ]; then
      echo "            Install it from: ${LINUX_PAGE[$i]}"
    else
      echo "            Install it from: ${MAC_PAGE[$i]}"
    fi
    echo "            Then close this terminal, open a new one in the same folder, and run this check again."
    echo "            Full guide: ${GUIDE[$i]}"
  elif version_at_least "$version" "${MINS[$i]}"; then
    ready=$((ready + 1))
    echo "  [ok]      ${NAMES[$i]}: version $version found. We test with ${TESTED[$i]}."
  else
    ready=$((ready + 1))
    echo "  [old]     ${NAMES[$i]}: version $version found, older than ${TESTED[$i]}, which we test with."
    echo "            Most things will work. If a command fails, update it: ${GUIDE[$i]}"
  fi
done
echo

if [ -n "$wanted" ]; then
  [ "$missing" -eq 0 ] && echo "You are ready." || echo "Install it, then run this check again."
  [ "$missing" -eq 0 ]
  exit $?
fi
if [ "$ready" -gt 0 ]; then
  echo "You need only one language. Use one marked [ok] or [old]."
  exit 0
fi
echo "No language is ready yet. Pick one and install it; you need only one."
exit 1
