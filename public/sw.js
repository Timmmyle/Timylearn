/* Service worker: chạy offline. Trang & tài nguyên tĩnh: stale-while-revalidate. API & Supabase: luôn đi mạng. */
const CACHE = "onthi-v1";
const SHELL = ["/", "/hoc", "/dau", "/de-thi", "/tien-ich", "/tien-do", "/cai-dat", "/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/")) return;
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const hit = await c.match(req, { ignoreSearch: req.mode === "navigate" });
      const net = fetch(req).then((res) => { if (res.ok && res.type === "basic") c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })
  );
});
