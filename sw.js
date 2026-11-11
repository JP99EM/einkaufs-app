// Offline-Speicher der App. Bei Änderungen an der App die Versionsnummer erhöhen.
const CACHE = 'einkauf-v2';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'jspdf.umd.min.js', 'html5-qrcode.min.js',
  'icon-192.png', 'icon-512.png', 'icon-maskable.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Preis-Abfragen (Open Prices) immer live aus dem Netz
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // App-Dateien: zuerst Netz (für Updates), offline aus dem Speicher
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
