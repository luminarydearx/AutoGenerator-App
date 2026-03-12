/// <reference lib="webworker" />

const VERSION = "autogen-v4";
const CACHE_NAME = VERSION;

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
];

// Detect dev mode
const isDev =
  self.location.hostname === "localhost" ||
  self.location.hostname === "127.0.0.1";

// ======================
// INSTALL
// ======================
self.addEventListener("install", (event) => {
  if (isDev) {
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );

  self.skipWaiting();
});

// ======================
// ACTIVATE
// ======================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((names) => {
        return Promise.all(
          names.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          }),
        );
      }),
      self.clients.claim(),
    ]),
  );
});

// ======================
// FETCH
// ======================
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET
  if (req.method !== "GET") return;

  // Skip dev mode completely
  if (isDev) {
    event.respondWith(fetch(req));
    return;
  }

  // Skip API routes (always network)
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/cv") ||
    url.pathname.startsWith("/surat") ||
    url.pathname.startsWith("/materi")
  ) {
    event.respondWith(fetch(req));
    return;
  }

  // Navigation (HTML pages)
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put("/index.html", clone);
          });
          return response;
        })
        .catch(() => caches.match("/index.html")),
    );
    return;
  }

  // Static assets → network first, cache fallback
  event.respondWith(
    fetch(req)
      .then((response) => {
        if (
          response &&
          response.status === 200 &&
          response.type === "basic"
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, clone);
          });
        }
        return response;
      })
      .catch(() => caches.match(req)),
  );
});

// ======================
// MESSAGE
// ======================
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "CLEAR_CACHE") {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});
