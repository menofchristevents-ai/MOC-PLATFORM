/**
 * sw.js - Men of Christ Service Worker
 * Strategie: Network-First voor HTML (navigate), Cache-First voor assets
 */

const CACHE_NAME = "moc-cache-v23";
const scopeUrl = new URL(self.registration.scope);
const toScopeUrl = path => new URL(path, scopeUrl).toString();
const OFFLINE_URL = toScopeUrl("offline.html");

const urlsToCache = [
  "./",
  "index.html",
  "events.html",
  "about.html",
  "shop.html",
  "contact.html",
  "bedankt.html",
  "config.js",
  "motion.js",
  "manifest.json",
  "assets/hero-jesus.webp",
  "assets/icon-192.svg",
  "assets/icon-512.svg",
  OFFLINE_URL
].map(toScopeUrl);

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[SW] Precaching kernbestanden...");
      return cache.addAll(urlsToCache);
    }).catch(err => console.error("[SW] Precache mislukt:", err))
  );
  self.skipWaiting();
});

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
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          console.log("[SW] Netwerk offline - offline.html serveren");
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return networkResponse;
      });
    })
  );
});