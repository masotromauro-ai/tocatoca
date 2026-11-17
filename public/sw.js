/* ═══════════════════════════════════════════════════════════
   sw.js — BandoMaps instalable y sin conexión (fase 7 de ARQUITECTURA.md, 17-nov-2026).
   Sello: VERSION abajo. Si cambia la forma de guardar (qué se guarda o cómo), SUBE.

   Mauro, 17-nov-2026: «dale con la fase 7» — la app instalable que anda sin conexión, como el
   panel. No hay lista fija de archivos (Vite les pone un hash al nombre en cada compilación):
   se guarda lo que se va usando, así que lo que se abrió una vez con señal anda sin señal.

     · Las páginas (navegación): RED PRIMERO; sin señal, la copia guardada (o la portada).
       Así una subida nueva se ve apenas hay red, nunca una versión vieja con señal.
     · /assets/ (los archivos de Vite, con hash en el nombre): de la copia si está; si no, red.
       Un nombre con hash no cambia de contenido, así que la copia nunca queda vieja.
     · El SDK de Firebase (gstatic, versión fija en la dirección): igual que /assets/.
     · Lo demás del mismo sitio (íconos, public/gestos, public/codigo…): la copia al instante y
       se renueva por detrás.
     · La base (googleapis) NO pasa por acá: la guarda Firestore en el aparato (cuenta/firebase.js).
   ═══════════════════════════════════════════════════════════ */
const VERSION = "bandomaps-sw-1";
const PORTADA = "/";

// Lo que se puede guardar por pedido de la página: del mismo sitio, o el SDK de Firebase.
const deAca = (u) => { try { const x = new URL(u, self.location.origin);
  return x.origin === self.location.origin || (x.hostname === "www.gstatic.com" && x.pathname.startsWith("/firebasejs/")); } catch (e) { return false; } };

// Al instalarse guarda la portada y lo que ella pide (los /assets/ de esta compilación): la primera
// visita se bajó antes de que este service worker mandara, así que sin esto no quedaría nada guardado.
self.addEventListener("install", (ev) => {
  ev.waitUntil(caches.open(VERSION).then(async (c) => {
    const r = await fetch(PORTADA, { cache: "no-store" });
    if (!r.ok) return;
    const html = await r.clone().text();
    await c.put(PORTADA, r);
    const pide = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((m) => m[1]).filter(deAca);
    await c.addAll([...new Set(pide)]).catch(() => {});
  }).catch(() => {}).then(() => self.skipWaiting()));
});

// Y la página, cuando terminó de cargar, le pasa la lista de lo que bajó (los pedazos que se cargan
// después, public/cuenta, el SDK de Firebase): así lo de la primera visita también queda guardado.
self.addEventListener("message", (ev) => {
  const d = ev.data || {};
  if (d.tipo !== "guardar" || !Array.isArray(d.urls)) return;
  const urls = [...new Set(d.urls.filter((u) => typeof u === "string" && deAca(u)))].slice(0, 200);
  ev.waitUntil(caches.open(VERSION).then((c) => Promise.all(urls.map((u) =>
    c.match(u).then((ya) => ya || c.add(u).catch(() => {})))))); 
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const guardable = (r) => r && r.ok && (r.type === "basic" || r.type === "cors");
async function guardar(req, r) {
  if (guardable(r)) { const copia = r.clone(); caches.open(VERSION).then((c) => c.put(req, copia)).catch(() => {}); }
  return r;
}

self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  if (req.method !== "GET" || req.headers.has("range")) return;
  const url = new URL(req.url);
  const mismoSitio = url.origin === self.location.origin;
  const sdk = url.hostname === "www.gstatic.com" && url.pathname.startsWith("/firebasejs/");
  if (!mismoSitio && !sdk) return;                       // la base y todo lo de afuera, sin tocar

  if (req.mode === "navigate") {
    ev.respondWith(fetch(req).then((r) => guardar(req, r))
      .catch(() => caches.match(req).then((r) => r || caches.match(PORTADA))));
    return;
  }
  if (sdk || url.pathname.startsWith("/assets/")) {
    ev.respondWith(caches.match(req).then((r) => r || fetch(req).then((x) => guardar(req, x))));
    return;
  }
  const red = fetch(req).then((x) => guardar(req, x));
  ev.waitUntil(red.catch(() => {}));                     // la renovación termina aunque ya se haya contestado
  ev.respondWith(caches.match(req).then((r) => r || red));
});
