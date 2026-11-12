@echo off
rem Setup check for Windows: runs check-setup.ps1 next to this file, for this one run only, without changing any setting.
rem   check-setup.cmd          check every language
rem   check-setup.cmd java     check one language
rem Written by tools/render.mjs: do not edit.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0check-setup.ps1" %*
