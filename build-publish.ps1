# build-publish.ps1
# Rebuilds the publish/ folder (the one you drag to Netlify) from source.
# Mirrors the project minus dev files, so ALL event folders (/<slug>/) are
# included automatically. Excludes editor, docs, design handoff, apps-script.
# Run from this folder:  ./build-publish.ps1   (or right-click > Run with PowerShell)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$pub  = Join-Path $root 'publish'

$excludeTop = @(
  'publish', 'design', 'apps-script', '.claude', '.git',
  'editor.html', 'studio.html', 'content.sample.json',
  'build-publish.ps1', 'new-event.ps1', 'README.md', 'ROADMAP.md'
)

if (Test-Path $pub) { Remove-Item $pub -Recurse -Force }
New-Item -ItemType Directory -Path $pub | Out-Null

Get-ChildItem -Path $root -Force | Where-Object { $excludeTop -notcontains $_.Name } | ForEach-Object {
  Copy-Item $_.FullName -Destination $pub -Recurse -Force
}

# Editor/Studio scripts are dev tools, drop them from the published bundle.
foreach ($devjs in 'editor.js', 'studio.js') {
  $p = Join-Path $pub "js\$devjs"
  if (Test-Path $p) { Remove-Item $p -Force }
}

# Per-event Open Graph: bake title/description/url/image from each event's content.json
# into that event's index.html <head>, so social previews show the right couple/photo.
$SITE = 'https://vistochka.pp.ua'
$utf8 = New-Object System.Text.UTF8Encoding $false
function HtmlEsc([string]$s) { return ($s -replace '&', '&amp;' -replace '"', '&quot;' -replace '<', '&lt;' -replace '>', '&gt;') }
Get-ChildItem $pub -Directory | ForEach-Object {
  $cj  = Join-Path $_.FullName 'content.json'
  $idx = Join-Path $_.FullName 'index.html'
  if ((Test-Path $cj) -and (Test-Path $idx)) {
    try { $c = Get-Content $cj -Raw -Encoding UTF8 | ConvertFrom-Json } catch { return }
    $slug  = $_.Name
    $title = HtmlEsc ([string]$c.meta.title)
    $desc  = HtmlEsc ([string]$c.meta.description)
    $url   = "$SITE/$slug/"
    $img   = "$SITE/$slug/" + ([string]$c.hero.backgroundImage)
    $html  = Get-Content $idx -Raw -Encoding UTF8
    $html  = [regex]::Replace($html, '(<title>).*?(</title>)',                          { param($m) $m.Groups[1].Value + $title + $m.Groups[2].Value })
    $html  = [regex]::Replace($html, '(<meta name="description" content=").*?(">)',      { param($m) $m.Groups[1].Value + $desc  + $m.Groups[2].Value })
    $html  = [regex]::Replace($html, '(<meta property="og:title" content=").*?(">)',     { param($m) $m.Groups[1].Value + $title + $m.Groups[2].Value })
    $html  = [regex]::Replace($html, '(<meta property="og:description" content=").*?(">)',{ param($m) $m.Groups[1].Value + $desc  + $m.Groups[2].Value })
    $html  = [regex]::Replace($html, '(<meta property="og:url" content=").*?(">)',       { param($m) $m.Groups[1].Value + $url   + $m.Groups[2].Value })
    $inject = "  <meta property=`"og:image`" content=`"$img`">`r`n  <meta name=`"twitter:image`" content=`"$img`">`r`n</head>"
    $html  = [regex]::Replace($html, '</head>', { param($m) $inject })
    [System.IO.File]::WriteAllText($idx, $html, $utf8)
  }
}

Write-Host "publish/ rebuilt (shared app + all event folders, per-event OG). Drag 'publish' into Netlify."
Get-ChildItem $pub | Select-Object -ExpandProperty Name
