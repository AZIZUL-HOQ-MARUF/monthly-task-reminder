const CACHE_NAME = "task-reminder-cache-v3";
const BASE_PATH = self.location.pathname.replace(/\/service-worker\.js$/, "/");

const urlsToCache = [
  `${BASE_PATH}index.html`,
  `${BASE_PATH}`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}site.webmanifest`,
  `${BASE_PATH}favicon.ico`,
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    }).catch(err => {
      console.error("Caching failed:", err);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(cacheNames.map(cacheName => {
        if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
      }))
    )
  );
});
