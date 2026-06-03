/**
 * sw.js — Men of Christ Service Worker
 * Strategie: Network-First voor HTML (navigate), Cache-First voor assets
 * Technische correctie #3: offline fallback via navigate-mode detectie
 */

const CACHE_NAME = "moc-cache-v21";
const OFFLINE_URL = "/offline.html";

// ═══════════════════════════════════════════════════
// 1. INSTALL — Precache alle kernpagina's + offline fallback
// ═══════════════════════════════════════════════════
const urlsToCache = [
  "/",
  "/index.html",
  "/events.html",
  "/about.html",
  "/shop.html",
  "/contact.html",
  "/bedankt.html",
  "/assets/hero-jesus.webp",  // hero — extern bestand i.p.v. inline base64 (cachebaar)
  OFFLINE_URL  // ← Cruciaal: offline.html MOET in cache zitten vóór hij nodig is
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[SW] Precaching kernbestanden...");
      return cache.addAll(urlsToCache);
    }).catch(err => console.error("[SW] Precache mislukt:", err))
  );
  // Forceer onmiddellijke activatie (skip wachtrij)
  self.skipWaiting();
});

// ═══════════════════════════════════════════════════
// 2. ACTIVATE — Verwijder verouderde caches
// ═══════════════════════════════════════════════════
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log("[SW] Verouderde cache verwijderd:", name);
            return caches.delete(name);
          })
      )
    )
  );
  // Neem direct controle over alle open tabbladen
  self.clients.claim();
});

// ═══════════════════════════════════════════════════
// 3. FETCH — De kern van de offline strategie
// ═══════════════════════════════════════════════════
self.addEventListener("fetch", event => {
  // Verwerk alleen GET-verzoeken (geen POST-formulierdata cachen)
  if (event.request.method !== "GET") return;

  /**
   * STRATEGIE A: Network-First voor HTML-navigatie
   * 
   * event.request.mode === "navigate" is true als de gebruiker
   * een pagina opvraagt (adresbalk, link-klik). Dit is NIET
   * true voor subbronnen (CSS, afbeeldingen etc.).
   * 
   * Volgorde:
   * 1. Probeer netwerk (altijd actuele content)
   * 2. Als netwerk faalt → serveer offline.html uit cache
   * 
   * Dit voorkomt dat offline.html wordt ingeladen op de plek
   * van een afbeelding of CSS-bestand.
   */
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Succesvolle reactie: update de cache voor later
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          console.log("[SW] Netwerk offline — offline.html serveren");
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  /**
   * STRATEGIE B: Cache-First voor statische assets
   * (CSS, JS, afbeeldingen, fonts)
   * 
   * Volgorde:
   * 1. Kijk eerst in de cache (snelste voor herhaalbezoeken)
   * 2. Als niet in cache → haal van netwerk + sla op in cache
   */
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then(networkResponse => {
        // Alleen cache opslaan voor geldige responses
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      });
    })
  );
});
