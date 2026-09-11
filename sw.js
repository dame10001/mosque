const CACHE_NAME="jame-alhay-v117";
const SHELL = [
  "./", "./index.html", "./dashboard.html", "./admin.html", "./delegation.html", "./delegate.html", "./adhan.html", "./iqama.html",
  "./styles.css", "./app.js", "./telegram-miniapp.html", "./telegram-miniapp.js", "./telegram-settings.html", "./telegram-settings.js", "./ummalqura-data.js", "./offline.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/telegram/") || url.pathname.startsWith("/debug/")) return;

  event.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(async () => (await caches.match(req)) || caches.match("./offline.html"))
  );
});
