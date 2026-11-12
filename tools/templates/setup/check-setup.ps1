# Setup check for the {{course}} course.
# It only runs each language's version command. It installs nothing and changes nothing.
#
#   .\check-setup.cmd          check every language (you need only one)
#   .\check-setup.cmd java     check one language
#
# check-setup.cmd runs this script with "-ExecutionPolicy Bypass", which lets it run this once without changing any Windows setting.
# Written by tools/render.mjs from tools/languages.json and tools/templates/setup/check-setup.ps1: do not edit.

param([string]$Language = '')

$Languages = @(
#@LANGUAGES@
)

function ConvertTo-Version([string]$text) {
    if ($text -notmatch '\.') { $text = "$text.0" }
    return [version]$text
}

$ids = $Languages | ForEach-Object { $_.Id }
if ($Language -and ($ids -notcontains $Language)) {
    Write-Output "Unknown language `"$Language`". Use one of: $($ids -join ' ')"
    exit 2
}

Write-Output 'Checking your setup. This only reads versions; it installs and changes nothing.'
Write-Output ''
$ready = 0
$missing = 0
foreach ($l in $Languages) {
    if ($Language -and $l.Id -ne $Language) { continue }
    $out = (cmd /c "$($l.Command) 2>&1" | Select-Object -First 5) -join "`n"
    $version = $null
    if ($out -match $l.Pattern) { $version = $Matches[1] }
    if (-not $version) {
        $missing++
        Write-Output "  [missing] $($l.Name): `"$($l.Command)`" did not print a version."
        if ($l.Install) {
            Write-Output "            Install it with: $($l.Install)"
            Write-Output "            Or from: $($l.Page)"
        } else {
            Write-Output "            Install it from: $($l.Page)"
        }
        if ($l.Note) { Write-Output "            $($l.Note)" }
        Write-Output '            Then close this terminal, open a new one in the same folder, and run this check again.'
        Write-Output "            Full guide: $($l.Guide)"
    } elseif ((ConvertTo-Version $version) -ge (ConvertTo-Version $l.Min)) {
        $ready++
        Write-Output "  [ok]      $($l.Name): version $version found. We test with $($l.Tested)."
    } else {
        $ready++
        Write-Output "  [old]     $($l.Name): version $version found, older than $($l.Tested), which we test with."
        Write-Output "            Most things will work. If a command fails, update it: $($l.Guide)"
    }
}
Write-Output ''

if ($Language) {
    if ($missing -eq 0) { Write-Output 'You are ready.'; exit 0 }
    Write-Output 'Install it, then run this check again.'
    exit 1
}
if ($ready -gt 0) {
    Write-Output 'You need only one language. Use one marked [ok] or [old].'
    exit 0
}
Write-Output 'No language is ready yet. Pick one and install it; you need only one.'
exit 1
