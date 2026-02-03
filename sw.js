// Subí versiones cuando cambies la lógica de cacheo (para forzar actualización en clientes)
// Bump this when deploying to force clients to refresh cached core assets.
const CACHE_NAME = "colectivo-cache-v7";

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
  "./ads/instagram.png",
  "./ads/whatsapp.png",
  "./ads/sponsors/blacktucan/main/hero.webp",
  "./ads/sponsors/blacktucan/main/takeover.webp",
  "./favicon.ico",
];

// Cache runtime para endpoints del Worker PUBLIC (cross-origin)
// Esto ayuda a que la última lista de promos/ads quede disponible si el usuario se queda sin internet.
const API_CACHE_NAME = "colectivo-api-cache-v4";

function isPublicApiRequest(url) {
  // Ajustado al patrón: https://<algo>.workers.dev/api/public/...
  return url.hostname.endsWith(".workers.dev") && url.pathname.startsWith("/api/public/");
}

function isImageRequest(req, url) {
  if (req.destination === "image") return true;
  return /\.(png|jpg|jpeg|gif|webp|svg|avif)$/i.test(url.pathname);
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
  // Nota: para <img src="https://...workers.dev/..."> el request suele venir en modo "no-cors" y la respuesta es "opaque".
  // Igual queremos cachearla para soportar Offline.
  if (isPublicApiRequest(url)) {
    event.respondWith((async () => {
      const cache = await caches.open(API_CACHE_NAME);
      // Robusto ante "cache-busting" (?v=...): devolvemos lo último aunque cambie el query
      const cached = await cache.match(req, { ignoreSearch: true });

      const isImg = (req.destination === "image") || /\.(png|jpg|jpeg|gif|webp|svg|avif)$/i.test(url.pathname);

      const fetchPromise = fetch(req)
        .then((res) => {
          // res.ok cubre respuestas CORS normales; res.type=="opaque" cubre imágenes no-cors
          if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
          return res;
        })
        .catch(() => {
          if (cached) return cached;
          // Si es JSON y no hay cache, devolvemos [] para que la UI no "rompa".
          if (!isImg) {
            return new Response("[]", {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }
          // Para imágenes sin cache: 504
          return new Response("", { status: 504 });
        });

      return cached || fetchPromise;
    })());
    return;
  }

  // Solo cacheamos recursos del mismo origen (tu dominio pages.dev)
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const isNav = req.mode === "navigate";
    const isImg = isImageRequest(req, url);

    // Para imágenes, ignoramos VARY/SEARCH para evitar que el cache falle en offline
    const cached = isImg
      ? await cache.match(req, { ignoreSearch: true, ignoreVary: true })
      : await cache.match(req);

    const networkFetch = fetch(req)
      .then((res) => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      })
      .catch(() => {
        if (cached) return cached;
        // Solo las navegaciones caen a index.html; para imágenes devolvemos 504
        if (isNav) return cache.match("./index.html");
        return new Response("", { status: 504 });
      });

    return cached || networkFetch;
  })());
});
