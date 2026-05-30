# new-event.ps1 — scaffold a new event folder /<slug>/.
# Usage:  ./new-event.ps1 mykhailo-olena
# Creates /<slug>/ with index.html (renderer), content.json (from the
# template), and placeholder photos. Then edit content via editor.html.

param([Parameter(Mandatory = $true)][string]$Slug)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$dir  = Join-Path $root $Slug

if (Test-Path $dir) { Write-Error "Подія '$Slug' вже існує: $dir"; exit 1 }

New-Item -ItemType Directory -Path $dir, "$dir\assets\img", "$dir\assets\audio" | Out-Null
Copy-Item "$root\index.html"          "$dir\index.html"
Copy-Item "$root\content.sample.json" "$dir\content.json"
Copy-Item "$root\assets\img\placeholder-*.svg" "$dir\assets\img"

Write-Host "Створено подію /$Slug/"
Write-Host "Далі:"
Write-Host "  1. /editor.html -> впишіть slug '$Slug' -> 'Завантажити подію' -> редагуйте."
Write-Host "  2. 'Завантажити content.json' -> покладіть у '$Slug\' (замінивши)."
Write-Host "  3. Фото -> у '$Slug\assets\img\'. Музику -> '$Slug\assets\audio\background.mp3'."
Write-Host "  4. ./build-publish.ps1 -> залийте 'publish' на Netlify."
Write-Host "  URL події: https://<домен>/$Slug/"
