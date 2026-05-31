# Men of Christ Website

Dit is de live-ready webdesign map voor `menofchrist.nl`.

## Mapindeling

- `index.html`, `about.html`, `events.html`, `shop.html`, `contact.html`, `bedankt.html`, `offline.html` — actieve websitepagina's.
- `assets/` — live assets, waaronder de hero-afbeelding.
- `config.js` — maandelijkse eventlinks, social links en eventconfiguratie.
- `motion.js` — animaties, smooth scroll en dynamische link-injectie.
- `sw.js` + `manifest.json` — PWA/offline support.
- `tools/` — lokale validatiescripts.
- `docs/` — lokale bron-/overdrachtsdocumenten, niet voor deploy.
- `_archive/` — lokale oude exports/prototypes, niet voor deploy.

## Lokaal bekijken

```powershell
python -m http.server 3002
```

Open daarna `http://localhost:3002`.

## Validatie

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools\validate-site.ps1
```

## Live zetten

Publiceer deze map als statische website. Er is geen build step nodig.

- Netlify: publish directory `.` en build command leeg. `netlify.toml` staat al klaar.
- Vercel: framework `Other`, build command leeg, output/root leeg laten.
- GitHub Pages: deploy from branch, folder `/root`. `.nojekyll` staat al klaar.

## Maandelijkse updates

Pas alleen `config.js` aan voor nieuwe events:

- `MOC_CONFIG.eventbriteTicketsUrl`
- `MOC_CONFIG.youtubePromoUrl`
- `MOC_EVENTS.current.flyerUrl`
- `MOC_EVENTS.current.themeNL/themeEN`
