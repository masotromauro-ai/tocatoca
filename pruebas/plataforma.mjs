// pruebas/plataforma.mjs — la fase 7 de ARQUITECTURA.md (17-nov-2026), con node a secas: React 19 con su
// compilador, la app instalable y sin conexión (manifest + service worker) y la base guardada en el aparato.
// Lo que cuida es lo que NO tiene que pasar: que el service worker se meta con la base, que guarde una
// página vieja cuando hay señal, o que se registre mientras se desarrolla.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const leer = (r) => fs.readFileSync(path.join(raiz, r), "utf8");
let ok = 0, mal = 0;
const t = (n, f) => { try { f(); ok++; } catch (e) { mal++; console.log("✖", n, e.message); } };

const pkg = JSON.parse(leer("package.json"));
t("React 19 y el compilador", () => {
  assert.match(pkg.dependencies.react, /^\^19\./);
  assert.match(pkg.dependencies["react-dom"], /^\^19\./);
  assert.ok(pkg.devDependencies["babel-plugin-react-compiler"]);
  assert.match(leer("vite.config.js"), /babel-plugin-react-compiler/);
});

const man = JSON.parse(leer("public/manifest.webmanifest"));
t("el manifest: nombre, pantalla completa y los íconos que existen", () => {
  assert.equal(man.name, "BandoMaps");
  assert.equal(man.display, "standalone");
  assert.equal(man.start_url, "/");
  for (const ic of man.icons) assert.ok(fs.existsSync(path.join(raiz, "public", ic.src)), ic.src);
  assert.ok(man.icons.some((i) => i.sizes === "192x192") && man.icons.some((i) => i.sizes === "512x512"));
  assert.ok(man.icons.some((i) => i.purpose === "maskable"));
});
t("index.html enlaza el manifest y los íconos", () => {
  const h = leer("index.html");
  assert.match(h, /<link rel="manifest" href="\/manifest\.webmanifest"/);
  assert.match(h, /apple-touch-icon/);
  assert.ok(fs.existsSync(path.join(raiz, "public", "apple-touch-icon.png")));
});

const sw = leer("public/sw.js");
t("sw.js parsea y tiene su VERSION", () => {
  new vm.Script(sw);
  assert.match(sw, /const VERSION = "bandomaps-sw-\d+";/);
});
// Un service worker de mentira: se corre sw.js con un `self`, `caches` y `fetch` falsos y se mira qué
// hace con cada pedido.
function correrSW({ red = true, cache = {} } = {}) {
  const oyentes = {}, guardado = { ...cache }, pedidosRed = [];
  const resp = (u, origen = "red") => ({ ok: true, type: "basic", url: u, origen, clone() { return { ...this }; } });
  const ctx = {
    self: { addEventListener: (n, f) => { oyentes[n] = f; }, location: { origin: "https://bandomaps.app" }, skipWaiting() {}, clients: { claim() {} } },
    caches: {
      open: async () => ({ add: async () => {}, put: async (req, r) => { guardado[req.url] = r; } }),
      match: async (req) => guardado[typeof req === "string" ? "https://bandomaps.app" + req : req.url] || undefined,
      keys: async () => [], delete: async () => true,
    },
    fetch: async (req) => { pedidosRed.push(req.url); if (!red) throw new Error("sin red"); return resp(req.url); },
    URL, Promise, console,
  };
  vm.runInNewContext(sw, ctx);
  const pedir = async (u, modo = "cors", metodo = "GET") => {
    let respuesta = null, tocado = false;
    const ev = { request: { url: u, method: metodo, mode: modo, headers: { has: () => false } },
      respondWith: (p) => { tocado = true; respuesta = p; }, waitUntil: () => {} };
    oyentes.fetch(ev);
    return { tocado, r: tocado ? await respuesta.catch(() => null) : null };
  };
  return { pedir, guardado, pedidosRed };
}
const asinc = [];
const ta = (n, f) => asinc.push(f().then(() => { ok++; }, (e) => { mal++; console.log("✖", n, e.message); }));
ta("la base (googleapis) y lo de afuera no pasan por el service worker", async () => {
  const s = correrSW();
  assert.equal((await s.pedir("https://firestore.googleapis.com/v1/projects/x")).tocado, false);
  assert.equal((await s.pedir("https://cdn.otro.com/a.js")).tocado, false);
  assert.equal((await s.pedir("https://bandomaps.app/x", "cors", "POST")).tocado, false);
});
ta("con señal, la página viene de la red (nunca una versión vieja)", async () => {
  const s = correrSW({ cache: { "https://bandomaps.app/": { origen: "vieja" } } });
  const { r } = await s.pedir("https://bandomaps.app/", "navigate");
  assert.equal(r.origen, "red");
});
ta("sin señal, la página sale de la copia (y si no está, la portada)", async () => {
  const s = correrSW({ red: false, cache: { "https://bandomaps.app/": { origen: "portada" } } });
  assert.equal((await s.pedir("https://bandomaps.app/", "navigate")).r.origen, "portada");
  assert.equal((await s.pedir("https://bandomaps.app/otra", "navigate")).r.origen, "portada");
});
ta("lo de /assets/ (con hash) y el SDK de Firebase salen de la copia sin ir a la red", async () => {
  const s = correrSW({ cache: { "https://bandomaps.app/assets/index-abc.js": { origen: "copia" },
    "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js": { origen: "copia" } } });
  assert.equal((await s.pedir("https://bandomaps.app/assets/index-abc.js")).r.origen, "copia");
  assert.equal((await s.pedir("https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js")).r.origen, "copia");
  assert.equal(s.pedidosRed.length, 0);
});

t("el service worker se registra sólo en la compilación, y si falla la app sigue", () => {
  const m = leer("src/main.jsx");
  assert.match(m, /import\.meta\.env\.PROD && "serviceWorker" in navigator/);
  assert.match(m, /register\("\/sw\.js"\)\.catch\(/);
});
t("la base guarda en el aparato, y si el navegador no deja, anda igual", () => {
  const f = leer("public/cuenta/firebase.js");
  assert.match(f, /persistentLocalCache\(\{ tabManager: fs\.persistentMultipleTabManager\(\) \}\)/);
  assert.match(f, /catch \(e\) \{\s*db = fs\.getFirestore\(app\);/);
  assert.match(f, /VERSION = "cuenta-init-2"/);
});

await Promise.all(asinc);
console.log(`${ok} pasadas, ${mal} fallidas`);
process.exit(mal ? 1 : 0);
