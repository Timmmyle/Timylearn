/* Service worker: chạy offline.
   - Trang (HTML): mạng trước, mất mạng mới dùng bản lưu → bản deploy mới hiện ngay, không bị kẹt bản cũ.
   - File tĩnh có mã băm (/_next/static): lưu trước, vì tên file đổi mỗi lần build.
   - Còn lại: stale-while-revalidate. API & Supabase: luôn đi mạng. */
const CACHE = "onthi-v2";
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
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } return res; })
        .catch(() => caches.open(CACHE).then((c) => c.match(req, { ignoreSearch: true }).then((h) => h || c.match("/"))))
    );
    return;
  }
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const hit = await c.match(req, { ignoreSearch: req.mode === "navigate" });
      const net = fetch(req).then((res) => { if (res.ok && res.type === "basic") c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })
  );
});
