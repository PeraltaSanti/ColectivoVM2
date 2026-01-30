const CACHE_NAME = "colectivo-cache-v1";

// Archivos “core” que querés que estén disponibles incluso offline
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./horarios.js",
  "./mapdata_all.js",
  "./leaflet.js",
  "./leaflet.css",
  "./manifest.json",
  "./instagram.png",
  "./whatsapp.png",
  "./favicon.ico",
];

// Cache runtime para endpoints del Worker PUBLIC (cross-origin)
// Esto ayuda a que la última lista de promos/ads quede disponible si el usuario se queda sin internet.
const API_CACHE_NAME = "colectivo-api-cache-v1";

function isPublicApiRequest(url) {
  // Ajustado al patrón: https://<algo>.workers.dev/api/public/...
  return url.hostname.endsWith(".workers.dev") && url.pathname.startsWith("/api/public/");
}

// Instalación: guarda lo esencial en cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// Activación: limpia caches viejos si cambiás de versión
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== API_CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: estrategia simple
// - Si es de tu mismo sitio: devuelve cache primero y luego actualiza en segundo plano.
// - Si es externo (tiles del mapa), lo deja pasar sin tocar (evita problemas).
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET") return;

  // Cache runtime para la API pública (cross-origin)
  if (isPublicApiRequest(url)) {
    event.respondWith((async () => {
      const cache = await caches.open(API_CACHE_NAME);
      const cached = await cache.match(req);
      try {
        const res = await fetch(req);
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      } catch (e) {
        return cached || Response.error();
      }
    })());
    return;
  }

  // Solo cacheamos recursos del mismo origen (tu dominio pages.dev)
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);

    const networkFetch = fetch(req).then((res) => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => cached);

    return cached || networkFetch;
  })());
});
