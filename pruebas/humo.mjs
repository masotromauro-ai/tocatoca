// pruebas/humo.mjs — la prueba de humo de BandoMaps (fase 0 de ARQUITECTURA.md).
// Compila la app, la abre en un navegador de verdad, entra a cada pestaña y compara el HTML que dibuja con
// el guardado en pruebas/humo/ (la «foto» de antes de mover algo). Falla si cambia lo que se ve o si hay
// un error en la consola. Corre en el chat de Claude: Mariano no instala nada.
//
//   node pruebas/humo.mjs              compara contra pruebas/humo/*.html
//   node pruebas/humo.mjs --guardar    guarda la foto de ahora (sólo antes de empezar una fase, con la app sana)
//
// Sin cuenta de verdad: se le sirve a la Puerta un /cuenta/firebase.js de mentira con un administrador. Lo único
// de afuera que se toca es esta máquina: se corta todo pedido a otro dominio, y el azar va con semilla fija.
// No agrega nada a package.json: usa Playwright del entorno (npm root -g) y el vite que ya está.
// La compilación va a una carpeta nueva del directorio temporal del sistema, y ahí queda: la limpia el sistema.
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const FOTOS = path.join(raiz, "pruebas", "humo");
const guardar = process.argv.includes("--guardar");

async function cargarPlaywright() {
  try { return (await import("playwright")).chromium; } catch (e) {}
  const g = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
  return createRequire(path.join(g, "x.js"))("playwright").chromium;
}

// ── Un Firebase de mentira: una persona administradora con la ficha activa ──
const FIREBASE_FALSO = `
const usuario = { uid: "humo", email: "humo@ejemplo.invalid", emailVerified: true };
const ficha = { activo: true, rol: "admin", nombre: "Humo", mail: "humo@ejemplo.invalid" };
export const VERSION = "humo";
export const firebaseConfig = {};
export const auth = {}; export const db = {};
export const A = { onAuthStateChanged: (_a, cb) => { setTimeout(() => cb(usuario), 0); return () => {}; }, signOut: async () => {} };
export const F = {
  doc: (...p) => ({ ruta: p.slice(1).join("/") }),
  onSnapshot: (ref, ok) => { setTimeout(() => ok({ exists: () => ref.ruta.startsWith("usuarios/"), data: () => ficha }), 0); return () => {}; },
  getDoc: async () => ({ exists: () => false, data: () => ({}) }),
  setDoc: async () => {}, increment: (n) => n, collection: () => ({}), getDocs: async () => ({ docs: [], forEach() {} }),
  query: () => ({}), where: () => ({}),
};
export async function cargarFirebase() { return true; }
`;
// El azar con semilla: el Entrenador sortea preguntas, y sin esto cada corrida dibuja otra cosa
const SEMILLA = `(() => { let s = 123456789; Math.random = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })();`;

const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".woff2": "font/woff2" };
function servir(dir) {
  return new Promise((ok) => {
    const s = http.createServer((q, r) => {
      let p = decodeURIComponent(q.url.split("?")[0]); if (p === "/") p = "/index.html";
      const f = path.join(dir, p);
      if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); r.end("no"); return; }
      r.writeHead(200, { "content-type": TIPOS[path.extname(f)] || "application/octet-stream" }); r.end(fs.readFileSync(f));
    }).listen(0, "127.0.0.1", () => ok(s));
  });
}

const salida = fs.mkdtempSync(path.join(os.tmpdir(), "humo-dist-"));
console.log("• compilando…");
try { execFileSync(path.join(raiz, "node_modules", ".bin", "vite"), ["build", "--outDir", salida, "--logLevel", "error"], { cwd: raiz, stdio: "inherit" }); }
catch (e) { console.log("✖ vite build falló: no hay nada que mirar."); process.exit(1); }

const server = await servir(salida);
const origen = `http://127.0.0.1:${server.address().port}`;
const chromium = await cargarPlaywright();
const nav = await chromium.launch();
const ctx = await nav.newContext({ viewport: { width: 1280, height: 900 } });
await ctx.addInitScript(SEMILLA);
await ctx.route("**/*", (ruta) => {
  const u = new URL(ruta.request().url());
  if (u.origin !== origen) return ruta.abort();                                   // nada de afuera
  if (u.pathname === "/cuenta/firebase.js") return ruta.fulfill({ contentType: "text/javascript", body: FIREBASE_FALSO });
  return ruta.continue();
});
const pag = await ctx.newPage();
const problemas = [];
pag.on("pageerror", (e) => problemas.push("error de la página: " + e.message));
pag.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|net::ERR_FAILED/.test(m.text())) problemas.push("consola: " + m.text()); });

await pag.goto(origen, { waitUntil: "load" });
await pag.waitForSelector(".nav-item", { timeout: 15000 }).catch(() => { problemas.push("no apareció el menú de pestañas: la Puerta no dejó entrar o la app no dibujó"); });
const cuantos = (await pag.$$(".nav-item")).length;
const fotos = {};
for (let i = 0; i < cuantos; i++) {
  const b = (await pag.$$(".nav-item"))[i];
  const etiqueta = ((await b.innerText()) || "").trim().replace(/\s+/g, " ");
  await b.evaluate((el) => el.click()); await pag.waitForTimeout(400);
  const id = await pag.evaluate(() => window.__tab);
  const html = await pag.evaluate(() => document.getElementById("root").innerHTML);
  fotos[id] = { etiqueta, html };
}
await nav.close(); server.close();

if (!Object.keys(fotos).length) { console.log("✖ no se pudo entrar a ninguna pestaña."); problemas.forEach((p) => console.log("   " + p)); process.exit(1); }
fs.mkdirSync(FOTOS, { recursive: true });
let mal = 0;
for (const [id, { etiqueta, html }] of Object.entries(fotos)) {
  const f = path.join(FOTOS, id + ".html");
  const hash = crypto.createHash("sha256").update(html).digest("hex").slice(0, 10);
  if (guardar) { fs.writeFileSync(f, html); console.log(`  📸 ${id.padEnd(11)} ${etiqueta.padEnd(14)} ${html.length} bytes · ${hash}`); continue; }
  if (!fs.existsSync(f)) { mal++; console.log(`  ✖ ${id}: no hay foto guardada (¿pestaña nueva? corré --guardar con la app sana)`); continue; }
  const antes = fs.readFileSync(f, "utf8");
  if (antes === html) console.log(`  ✓ ${id.padEnd(11)} ${etiqueta.padEnd(14)} igual (${hash})`);
  else {
    mal++; let i = 0; while (i < antes.length && antes[i] === html[i]) i++;
    console.log(`  ✖ ${id}: cambió lo que dibuja, desde el carácter ${i}\n      antes:  …${antes.slice(Math.max(0, i - 40), i + 100)}\n      ahora:  …${html.slice(Math.max(0, i - 40), i + 100)}`);
  }
}
if (!guardar) for (const f of fs.readdirSync(FOTOS)) if (f.endsWith(".html") && !fotos[f.slice(0, -5)]) { mal++; console.log(`  ✖ ${f.slice(0, -5)}: tiene foto y la pestaña ya no está`); }
problemas.forEach((p) => { mal++; console.log("  ✖ " + p); });
console.log(guardar ? `\nFotos guardadas: ${Object.keys(fotos).length}.` : `\n${mal ? mal + " problema(s)" : "Todo igual: " + Object.keys(fotos).length + " pestañas sin errores"}.`);
process.exit(mal ? 1 : 0);
