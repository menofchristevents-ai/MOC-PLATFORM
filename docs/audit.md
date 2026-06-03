# MOC Platform — Technische Audit

**Datum:** 2026-06-04
**Scope:** volledige statische site (HTML / JS / PWA-assets) — debug, test, fix
**Commit:** `449b317` (gepusht naar `main`)
**Methode:** systematische root-cause analyse → fix → verificatie (geen symptoom-patches)

---

## Samenvatting

| Prioriteit | Bevinding | Status |
|---|---|---|
| P0 | `index.html` was 1.3MB door inline base64 hero | ✅ Opgelost |
| Bug | `shop.html` was afgekapt / corrupt | ✅ Opgelost |
| P1 | DST-bug in agenda-export (`events.html`) | ✅ Opgelost |
| P1 | Rickroll als promo-trailer URL | ✅ Opgelost |
| P2 | `bedankt.html` registreerde geen service worker | ✅ Opgelost |
| P2 | Service worker gebruikte root-paden, kwetsbaar op GitHub Pages subpad | ✅ Opgelost |
| Cleanup | 6MB ongebruikte PNG in repo | ✅ Verwijderd |
| Flag | Tailwind via play-CDN | ⚠️ Open — jouw keuze |
| Flag | Placeholder Eventbrite-link | ⚠️ Open — maandelijks invullen |
| Flag | Promo-trailer wijst nu naar kanaal, niet een video | ⚠️ Open — echte URL invullen |
| Flag | Kritieke afbeeldingen op externe hosts | ⚠️ Open — overweeg zelf hosten |

---

## Opgeloste problemen

### P0 — Hero-afbeelding blies `index.html` op tot 1.3MB

**Probleem.** De hero-achtergrond stond als 1.28MB base64-WebP rechtstreeks ín `index.html` (96% van het bestand). Gevolgen:
- Blokkeert het renderen van de pagina (HTML-parser moet eerst 1.3MB door).
- Niet apart te cachen — wordt bij élk bezoek opnieuw gedownload.
- Geen parallelle download / lazy-load mogelijk.

**Root cause.** Afbeelding inline ge-encode i.p.v. als los bestand gelinkt.

**Fix.**
- Base64 gedecodeerd → `assets/hero-jesus.webp` (941KB, geldige `RIFF/WEBP`).
- `index.html` verwijst nu via `src="assets/hero-jesus.webp"`.
- Service worker (`sw.js`) precachet het bestand, versie `v20 → v21`.

**Resultaat.** `index.html`: **1.328.239 → 43.710 tekens (−97%)**. Hero ziet er visueel identiek uit (zelfde bytes), laadt alleen veel sneller — vooral mobiel.

---

### Bug — `shop.html` was afgekapt en ongeldig

**Probleem.** Bestand eindigde abrupt midden in een functie:
- Laatste `<script>` nooit gesloten (9 open / 8 dicht).
- `syncDarkIcons()` afgekapt halverwege de body.
- Geen `</body>`, geen `</html>`.

Browser sloot dit automatisch, dus het *leek* te werken — stille corruptie. Alle JS ná het afkappunt was verdwenen (o.a. service-worker-registratie).

**Root cause.** Bestand afgekapt tijdens opslaan/genereren.

**Fix.** Functie afgesloten, init-aanroep + service-worker-registratie toegevoegd, tags gesloten — gemodelleerd op `about.html`. Nu 9/9 script-tags in balans, `</body>`/`</html>` aanwezig.

---

### P1 — DST-bug in agenda-export (`events.html`)

**Probleem.** `toGCalDate()` gebruikte een hardcoded `utcHours = hours - 2`. Dat klopt alleen in de zomer (CEST, UTC+2). In de winter (CET, UTC+1) waren de "Zet in agenda"-exports **één uur te vroeg**. Events zijn maandelijks (elke laatste zaterdag), dus het halve jaar fout.

**Root cause.** Vaste offset i.p.v. werkelijke tijdzone-offset berekenen.

**Fix.** Echte Europe/Amsterdam-offset berekend op basis van de EU-DST-regels (laatste zondag maart 01:00 UTC → laatste zondag oktober 01:00 UTC = +2, anders +1).

**Test.** Unit-test 8/8 geslaagd, inclusief de DST-grensgevallen:

| Datum | Verwacht | Resultaat |
|---|---|---|
| 2026-01-31 (winter) | +1 | ✅ |
| 2026-03-28 (za vóór omschakeling) | +1 | ✅ |
| 2026-03-29 (zo omschakeling) | +2 | ✅ |
| 2026-06-27 (zomer) | +2 | ✅ |
| 2026-10-24 (za vóór terug) | +2 | ✅ |
| 2026-10-31 | +1 | ✅ |
| 2026-12-26 (winter) | +1 | ✅ |

---

### P1 — Rickroll als promo-trailer

**Probleem.** `youtubePromoUrl` (in `config.js`) én de hardcoded `href` in `events.html` wezen naar `youtube.com/watch?v=dQw4w9WgXcQ` — Rick Astley, "Never Gonna Give You Up". "Bekijk de Promo Trailer" rickrollde bezoekers op een ministry-site.

**Fix.** Beide plekken vervangen door de YouTube-kanaal-URL als veilige fallback.

> ⚠️ **Actie vereist:** zet de échte trailer-URL in `config.js → youtubePromoUrl`. De link wijst nu naar het kanaal, niet naar een specifieke video.

---

### P2 — `bedankt.html` registreerde geen service worker

**Probleem.** Andere pagina's registreren `/sw.js`; `bedankt.html` niet → inconsistent offline-gedrag.

**Fix.** Service-worker-registratie toegevoegd (zelfde patroon als overige pagina's).

---

### P2 — Service worker niet subpad-safe op GitHub Pages

**Probleem.** De live site draait onder een GitHub Pages subpad (`/MOC-PLATFORM/`), maar de service-worker-registraties gebruikten `/sw.js` en `sw.js` precachete root-paden zoals `/index.html`, `/offline.html` en `/assets/hero-jesus.webp`. Op een subpad-deployment verwijzen zulke paden naar de domein-root in plaats van naar de projectmap.

**Root cause.** Absolute root-paden in PWA-code, terwijl de site niet op de domein-root draait.

**Fix.**
- Alle pagina's registreren nu `sw.js` relatief aan de huidige projectmap.
- `sw.js` leidt precache-URLs af van `self.registration.scope`.
- Cache-versie verhoogd naar `moc-cache-v22`, zodat oude root-cache entries worden vervangen.
- Het contactformulier gebruikt nu `action="bedankt.html"` in plaats van `/bedankt.html`, zodat de bedanktpagina ook onder het GitHub Pages subpad correct opent.

**Visuele impact.** Geen. Er is niets gewijzigd aan CSS, hero-positionering, hero-afbeelding, markup-structuur of pagina-layout. De hero blijft zoals op de foto; alleen de PWA/offline-paden zijn gecorrigeerd.

---

### Cleanup — 6MB ongebruikte PNG verwijderd

`assets/jesus-king-sketch.png` (6,2MB) werd nergens in de site geladen — dezelfde Jezus-schets als de hero, maar hi-res met transparante achtergrond. Dood gewicht in de repo. Verwijderd.

---

## Open punten — jouw keuze (niet aangeraakt)

| # | Punt | Waarom geflagd | Aanbevolen actie |
|---|---|---|---|
| 1 | **Tailwind via `cdn.tailwindcss.com`** | Play-CDN, ~400KB runtime-compile + FOUC. Tailwind zegt zelf: niet voor productie. | Echte fix = build-stap (Tailwind CLI). Voor een no-build site is dat een grote ingreep — bewust opengelaten. |
| 2 | **Eventbrite-link `...123456789`** | Nep-placeholder. In `config.js` gedocumenteerd als maandelijks-bij-te-werken veld. | Echte Eventbrite-link plakken in `config.js`. |
| 3 | **Promo-trailer** | Wijst nu naar kanaal, niet naar een video. | Echte video-URL invullen in `config.js`. |
| 4 | **Externe afbeeldingen** | Hero-bron, flyer (`googleusercontent`), PWA-iconen (`placehold.co`) leunen op externe diensten die kunnen verdwijnen. | Kritieke beelden zelf hosten in `assets/`. |
| 5 | **PWA-iconen = placeholders** | `manifest.json` gebruikt `placehold.co`-iconen ("MOC"-tekst). | Echte app-iconen (192/512px) toevoegen. |

---

## Verificatie

Alle checks groen na de fixes:

- **Site-validator** (`tools/validate-site.ps1`): passed — 7 pagina's + 4 core-assets aanwezig.
- **JS-syntax** (`node --check`): `config.js`, `motion.js`, `sw.js` — alle OK.
- **Subpad service-worker check:** passed — geen absolute `/sw.js` registraties en geen absolute root-precache-paden meer.
- **DST unit-test:** 8/8.
- **Tag-balans** alle 7 pagina's: `<script>`/`</script>` in balans, exact één `</body>` + `</html>`.
- **Geen dode lokale links**, geen `href="#"`, alle `lang="nl"`.
- **Rickroll-URL** (`dQw4w9WgXcQ`) komt nergens meer voor.
- **Hero:** `assets/hero-jesus.webp` bestaat (963.396 bytes), wordt door `index.html` gerefereerd én door `sw.js` geprecached.

---

## Gewijzigde bestanden (commit `449b317`)

```
 assets/hero-jesus.webp       | nieuw (963.396 bytes)
 assets/jesus-king-sketch.png | verwijderd (6.235.499 bytes)
 bedankt.html                 | +5   (service worker)
 config.js                    | +1/-1 (promo-URL)
 events.html                  | +18/-2 (DST-fix + promo-URL)
 index.html                   | +1/-1 (hero extern)
 shop.html                    | +11/-1 (reparatie + service worker)
 sw.js                        | +2/-1 (cache v21 + hero precache)
```

## Aanvullende fix na screenshot-review

Na controle van de live-context op de screenshot (`https://menofchristevents-ai.github.io/MOC-PLATFORM/index.html`) is nog een PWA-padfix gedaan:

```
 about.html                   | /sw.js → sw.js
 bedankt.html                 | /sw.js → sw.js
 contact.html                 | /sw.js → sw.js
 contact.html                 | /bedankt.html → bedankt.html
 events.html                  | /sw.js → sw.js
 index.html                   | /sw.js → sw.js
 shop.html                    | /sw.js → sw.js
 sw.js                        | cache v21 → v22; precache-paden scope-aware
```

Deze wijziging raakt alleen service-worker/offline-cache gedrag en verandert niets aan het uiterlijk van de pagina's.

---

## Belangrijkste winst

1. **Home laadt ~97% lichter** (1.3MB → 43KB) — directe impact op mobiele bezoekers.
2. **`shop.html` was stilletjes kapot** — nu hersteld.

De rest is hygiëne en losse eindjes die jij moet invullen (echte links/iconen).
