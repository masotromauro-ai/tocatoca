// pruebas/areas.mjs — el mapa de áreas (areas.json) contra el App.jsx real, sin npm.
// Lo que importa: que el mapa NO MIENTA. Si alguien agrega o mueve una declaración en App.jsx y el
// mapa no la cubre, esta prueba falla y dice cuál. Así una guía para un chat nunca queda desactualizada.
import assert from "node:assert/strict";
import fs from "node:fs";
import { declaraciones, verificar, extraer, usa } from "../herramientas/areas.mjs";
let ok = 0, mal = 0;
const t = (n, f) => { try { f(); ok++; console.log("  ✓ " + n); } catch (e) { mal++; console.log("  ✗ " + n + "\n      " + e.message); } };
const src = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
const mapa = JSON.parse(fs.readFileSync(new URL("../areas.json", import.meta.url), "utf8"));
const decls = declaraciones(src);

t("las áreas cubren todas las declaraciones de App.jsx, en orden y sin repetir", () => {
  const e = verificar(mapa.areas, decls); assert.deepEqual(e, [], e.join("\n      "));
});
t("las líneas de las áreas suman las del archivo (menos los import de arriba)", () => {
  const suma = mapa.areas.reduce((s, a) => s + extraer(src, a, decls).lineas, 0);
  const total = src.split("\n").length, cabecera = decls[0].desde - 1;
  assert.equal(suma, total - cabecera, `suman ${suma}, el archivo tiene ${total - cabecera} sin la cabecera`);
});
t("un tramo roto se detecta", () => {
  assert.ok(verificar([{ id: "x", tramos: [["NoExiste", "NC"]] }], decls).length > 0);
  assert.ok(verificar([{ id: "x", tramos: [["nc", "NC"]] }], decls).length > 0, "al revés");
  assert.ok(verificar(mapa.areas.filter((a) => (a.tramos || []).length).slice(1), decls).length > 0, "falta la primera área");
});
t("cada área tiene título, qué hace, destino, fase y cómo probarla", () => {
  for (const a of mapa.areas) for (const k of ["id", "titulo", "que", "destino", "fase", "riesgo", "probar"]) assert.ok(a[k], a.id + " sin " + k);
});
t("ningún área nueva pesa más que el Entrenador (que es la que hay que partir)", () => {
  const mayor = mapa.areas.map((a) => ({ id: a.id, l: extraer(src, a, decls).lineas })).sort((x, y) => y.l - x.l)[0];
  assert.equal(mayor.id, "entrenador-pestana", "la más grande es " + mayor.id);
});
const leer = (r) => fs.readFileSync(new URL("../" + r, import.meta.url), "utf8");
t("las áreas ya movidas (fases 1 a 5) tienen sus archivos y ya no dejan nada en App.jsx", () => {
  const movidas = mapa.areas.filter((a) => a.movida);
  assert.ok(movidas.length >= 21, "se esperaban las áreas de las fases 1 a 5");
  for (const a of movidas) {
    assert.deepEqual(a.tramos, [], a.id + " movida pero con tramos en App.jsx");
    for (const f of a.archivos) { assert.ok(fs.existsSync(new URL("../" + f, import.meta.url)), a.id + ": falta " + f); }
  }
});
t("el paquete de las formas recomendadas sale de su archivo, es chico y avisa de dónde", () => {
  const a = mapa.areas.find((x) => x.id === "formas-recomendadas");
  const texto = a.archivos.map(leer).join("\n");
  assert.ok(texto.includes("function elegirVoicing") && texto.includes("function voicingsDe"));
  assert.ok(texto.split("\n").length < 80 && texto.length / 3.3 < 3000);
});
t("las formas recomendadas sólo dependen de tablas.js (shared no mira hacia arriba)", () => {
  const imp = [...leer("src/shared/bandoneon/voicings.js").matchAll(/from "([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(imp, ["./tablas.js"]);
});
t("un área no se cita a sí misma", () => {
  for (const a of mapa.areas.filter((x) => (x.tramos || []).length)) for (const x of usa(src, a, mapa.areas, decls)) assert.notEqual(x.area, a.id, `${a.id} se cita a sí misma por ${x.nombre}`);
});
console.log(`\n${ok} pasadas, ${mal} fallidas`); process.exit(mal ? 1 : 0);
