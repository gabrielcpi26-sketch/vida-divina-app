// public/sw.js
const CACHE = "vd-cache-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.webmanifest"
  // Después del primer deploy puedes agregar aquí rutas estáticas específicas si quieres cachearlas fijo.
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  // Solo cache del mismo origen (tu sitio)
  if (url.origin === self.location.origin) {
    // Estrategia: "Network first, fallback cache"
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
  }
});
