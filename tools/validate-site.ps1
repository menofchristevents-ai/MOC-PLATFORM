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

if ($failures.Count -gt 0) {
  $failures | ForEach-Object { Write-Error $_ }
  exit 1
}

Write-Host "MOC site validation passed: $($pages.Count) pages and $($assets.Count) core assets are present."
