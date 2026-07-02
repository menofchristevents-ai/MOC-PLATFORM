# MOC Platform Constitution

## Standards
- The site remains a static, no-build website.
- Runtime configuration belongs in `config.js`.
- Core navigation, manifest URLs, service-worker registrations, and thank-you flows must be relative so the site works on both a domain root and a GitHub Pages subpath.
- Critical PWA assets must be local files, not placeholder or third-party generated images.

## Governance
- Specs describe stable behavior; code implements it.
- Monthly event data can change without spec changes when it follows the existing schema.
- Unknown live business links must fail closed with a clear fallback instead of pretending to be active.

## Verification Invariants
- Seven HTML pages and four core assets must exist.
- HTML pages declare `lang="nl"` and contain no `href="#"`.
- JS files must pass `node --check`.
- The manifest must not contain root-relative URLs or external placeholder icons.
- Service-worker precache must include the local core assets needed for offline use.
