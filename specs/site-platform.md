# Spec: Static Site Platform

## Contract
- The site is deployable as static files with no build step.
- Local page and asset URLs are relative so subpath deployments keep working.
- `config.js` is the single monthly event update surface.
- If `eventbriteTicketsUrl`, `youtubePromoUrl`, or `donationUrl` is empty, UI must degrade safely and must not expose fake placeholder links.
- PWA manifest icons are local assets and install routes are subpath-safe.

## Verification
- `tools/validate-site.ps1` checks page presence, local links, config keys, manifest URL safety, local icons, and placeholder regressions.
- `node --check config.js motion.js sw.js` checks JavaScript syntax.
