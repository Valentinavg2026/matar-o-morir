const CACHE_NAME = "matar-o-morir-v3";
const BASE = self.registration.scope;
const SHELL = [
  new URL("./", BASE).href,
  new URL("./index.html", BASE).href,
  new URL("./manifest.webmanifest", BASE).href,
  new URL("./icon.svg", BASE).href,
  new URL("./icon-192.png", BASE).href,
  new URL("./icon-512.png", BASE).href,
  new URL("./The_Adventurer.glb", BASE).href,
  new URL("./The_FRSC_Officer_Nigeria.glb", BASE).href
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(new URL("./index.html", BASE), copy));
          return response;
        })
        .catch(() => caches.match(new URL("./index.html", BASE)))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      }
      return response;
    }))
  );
});
