self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Network-first; required for installability.
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
