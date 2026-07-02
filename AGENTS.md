# MOC Platform Work Contract

## Purpose
- Static website for Men of Christ, deployable without a build step.
- Keep monthly event changes isolated to `config.js` unless a page structure truly changes.

## Local Contracts
- Preserve the no-build deployment model: plain HTML, JS, PWA assets, and static images.
- Keep links subpath-safe for GitHub Pages: use relative local URLs, not root-relative `/...` URLs.
- Do not ship placeholder ticket, donation, promo, or icon URLs as if they are live.
- Keep PWA behavior offline-capable for the core pages.

## Work Guidance
- Prefer small fixes in existing files over adding dependencies or a build pipeline.
- Update `docs/PVA.md` when a known disadvantage is closed or a new one is accepted.
- Update `constitution.md` or `specs/site-platform.md` when stable site rules change.

## Verification
- Run `powershell -NoProfile -ExecutionPolicy Bypass -File tools\validate-site.ps1`.
- Run `node --check config.js`, `node --check motion.js`, and `node --check sw.js`.

## Child DOX Index
- `assets/` — local images and PWA icons.
- `docs/` — audit, transfer notes, and plan of approach.
- `tools/` — local validation scripts.
