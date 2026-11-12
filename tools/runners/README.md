# Test runners

Java and C++ have no test runner built in, and readers should not need to install one. So each project carries a small runner of its own: one file per language.

This folder will hold the master copy of each runner:

- `java/` : the Java runner.
- `cpp/` : the C++ runner, a header.

Every project's copy must be identical to the master copy here. `check.mjs` compares them, so a fix to a runner is made once here and then copied into every project.

Python uses `unittest` and JavaScript uses `node --test`, both built in, so they need no runner.

Every runner prints one line per test, `PASS <test name>` or `FAIL <test name>`, then a summary line, so `check.mjs` can read the results the same way in every language.
