# PVA — MOC Platform Bob Retrofit

## Doel
De bestaande statische MOC-site veiliger en onderhoudbaarder maken zonder het ontwerp of no-build deploymodel te slopen.

## Voordelen
- De site blijft simpel te deployen: geen build step, geen nieuwe dependency.
- Maandelijkse wijzigingen blijven in `config.js`.
- PWA en GitHub Pages subpad-gedrag worden expliciet gevalideerd.
- Bob-contracten maken toekomstige edits minder afhankelijk van chatcontext.

## Nadelen en Fixes
- N1: Geen git-metadata in deze map. Fix: werk in kleine, leesbare patches en leg contract/PVA/spec in repo-bestanden vast.
- N2: Geen eerdere constitution/spec/AGENTS. Fix: lichte Bob-retrofit toegevoegd met `AGENTS.md`, `constitution.md` en `specs/site-platform.md`.
- N3: Placeholder Eventbrite-link kon live lijken. Fix: config gebruikt leeg als onbekend en UI valt terug op RSVP per mail.
- N4: Promo-link was een kanaal-fallback, geen echte trailer. Fix: toegestaan als veilige fallback; echte trailer blijft maandelijks veld in `config.js`.
- N5: Manifest gebruikte root-routes en externe placeholder-iconen. Fix: relatieve routes en lokale PWA-iconen.
- N6: Validator ving manifest/PWA-placeholder regressies niet. Fix: validator uitgebreid.
- N7: Tailwind/animatie-CDN's blijven externe runtime-afhankelijkheid. Fix: bewust niet omgebouwd om no-build en visueel gedrag te behouden; vastgelegd als expliciete trade-off.

## Uitvoering
- [x] Bob-contracten vastgelegd in `AGENTS.md`, `constitution.md` en `specs/site-platform.md`.
- [x] Manifest en lokale iconen gerepareerd.
- [x] Ticketfallback fail-closed gemaakt: geen echte Eventbrite-link betekent geen nep-ticketknop of QR-code.
- [x] Service-worker-precache uitgebreid met `config.js`, `motion.js`, `manifest.json` en lokale iconen.
- [x] Validator aangescherpt op manifest, placeholder-URLs, root-relative PWA-paden en precache-regressies.
- [x] Validatie en JS-syntaxchecks gedraaid.

## Testresultaten
- `powershell -NoProfile -ExecutionPolicy Bypass -File tools\validate-site.ps1` — geslaagd.
- `node --check config.js` — geslaagd.
- `node --check motion.js` — geslaagd.
- `node --check sw.js` — geslaagd.
- HTML tag-balans voor 7 pagina's — geslaagd: script/body/html-tags in balans.
- Placeholder-regressiecheck — geslaagd: geen `placehold.co`, `123456789`, `dQw4w9WgXcQ`, `href="#"`, `/sw.js` of `/bedankt.html` in HTML/JS/JSON.

## Open Bewuste Trade-off
Tailwind, fonts, Lenis en GSAP blijven via CDN laden om het bestaande no-build model en de huidige visuele styling niet te slopen. Een echte CDN-verwijdering vraagt een aparte build- of vendoring-stap met visuele regressietest.