self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Present for installability, but deliberately does NOT call respondWith: the app
// has no offline story, so proxying every request through the worker only added a
// failure surface (a rejected fetch here is a hard load error with no fallback).
// Without respondWith the browser handles each request natively, as if unproxied.
self.addEventListener("fetch", () => {});
