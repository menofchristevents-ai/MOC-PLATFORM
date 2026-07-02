$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$pages = @("index.html", "about.html", "events.html", "shop.html", "contact.html", "bedankt.html", "offline.html")
$assets = @("config.js", "motion.js", "sw.js", "manifest.json")
$failures = New-Object System.Collections.Generic.List[string]

foreach ($page in $pages) {
  $path = Join-Path $root $page
  if (-not (Test-Path $path)) {
    $failures.Add("Missing page: $page")
    continue
  }

  $content = Get-Content -LiteralPath $path -Raw
  if ($content -notmatch '<html[^>]+lang="nl"') {
    $failures.Add("$page should declare lang=nl")
  }
  if ($content -match 'href="#"') {
    $failures.Add("$page contains placeholder href=#")
  }
  if ($content -match 'dQw4w9WgXcQ') {
    $failures.Add("$page contains the blocked rickroll video id")
  }
  if ($content -match '/sw\.js|/bedankt\.html') {
    $failures.Add("$page contains a root-relative PWA/form path")
  }

  $localLinks = [regex]::Matches($content, 'href="([^"#]*(?:\.html|\.js|\.json))"')
  foreach ($match in $localLinks) {
    $linked = $match.Groups[1].Value
    if ($linked -match '^(https?:|mailto:|tel:)') { continue }
    $clean = $linked.TrimStart('/')
    if ($clean -and -not (Test-Path (Join-Path $root $clean))) {
      $failures.Add("$page links to missing local file: $linked")
    }
  }
}

foreach ($asset in $assets) {
  if (-not (Test-Path (Join-Path $root $asset))) {
    $failures.Add("Missing asset: $asset")
  }
}

$config = Get-Content -LiteralPath (Join-Path $root 'config.js') -Raw
foreach ($key in @('eventbriteTicketsUrl', 'youtubePromoUrl', 'instagramUrl', 'youtubeChannelUrl')) {
  if ($config -notmatch $key) { $failures.Add("config.js missing $key") }
}
if ($config -match '123456789|dQw4w9WgXcQ') {
  $failures.Add("config.js contains a known placeholder URL")
}

$manifestPath = Join-Path $root 'manifest.json'
try {
  $manifestRaw = Get-Content -LiteralPath $manifestPath -Raw
  $manifest = $manifestRaw | ConvertFrom-Json
  if ($manifestRaw -match 'placehold\.co') {
    $failures.Add("manifest.json contains external placeholder icons")
  }
  if ($manifest.start_url -match '^/') {
    $failures.Add("manifest.json start_url must be relative for subpath deploys")
  }
  foreach ($icon in $manifest.icons) {
    if ($icon.src -match '^(https?:|/)') {
      $failures.Add("manifest.json icon must be a relative local asset: $($icon.src)")
    } elseif (-not (Test-Path (Join-Path $root $icon.src))) {
      $failures.Add("manifest.json icon file missing: $($icon.src)")
    }
  }
  foreach ($shortcut in $manifest.shortcuts) {
    if ($shortcut.url -match '^/') {
      $failures.Add("manifest.json shortcut URL must be relative: $($shortcut.url)")
    }
    foreach ($icon in $shortcut.icons) {
      if ($icon.src -match '^(https?:|/)') {
        $failures.Add("manifest.json shortcut icon must be relative: $($icon.src)")
      } elseif (-not (Test-Path (Join-Path $root $icon.src))) {
        $failures.Add("manifest.json shortcut icon file missing: $($icon.src)")
      }
    }
  }
} catch {
  $failures.Add("manifest.json is not valid JSON: $($_.Exception.Message)")
}

$sw = Get-Content -LiteralPath (Join-Path $root 'sw.js') -Raw
foreach ($precache in @('config.js', 'motion.js', 'manifest.json', 'assets/icon-192.svg', 'assets/icon-512.svg')) {
  if ($sw -notmatch [regex]::Escape($precache)) {
    $failures.Add("sw.js should precache $precache")
  }
}

if ($failures.Count -gt 0) {
  $failures | ForEach-Object { Write-Error $_ }
  exit 1
}

Write-Host "MOC site validation passed: $($pages.Count) pages and $($assets.Count) core assets are present."