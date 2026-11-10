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
  assert.ok(verificar(mapa.areas.slice(1), decls).length > 0, "falta la primera área");
});
t("cada área tiene título, qué hace, destino, fase y cómo probarla", () => {
  for (const a of mapa.areas) for (const k of ["id", "titulo", "que", "destino", "fase", "riesgo", "probar"]) assert.ok(a[k], a.id + " sin " + k);
});
t("ningún área nueva pesa más que el Entrenador (que es la que hay que partir)", () => {
  const mayor = mapa.areas.map((a) => ({ id: a.id, l: extraer(src, a, decls).lineas })).sort((x, y) => y.l - x.l)[0];
  assert.equal(mayor.id, "entrenador-pestana", "la más grande es " + mayor.id);
});
t("el paquete de un área trae su código y avisa de dónde sale", () => {
  const e = extraer(src, mapa.areas.find((a) => a.id === "formas-recomendadas"), decls);
  assert.ok(e.texto.includes("function elegirVoicing") && e.texto.includes("function voicingsDe"));
  assert.ok(e.lineas < 80 && e.tokens < 3000, `${e.lineas} líneas`);
});
t("las dependencias: las formas recomendadas sólo necesitan itemsMano, y un área no se cita a sí misma", () => {
  const u = usa(src, mapa.areas.find((a) => a.id === "formas-recomendadas"), mapa.areas, decls);
  assert.deepEqual(u.map((x) => x.nombre), ["itemsMano"]);
  assert.equal(u[0].area, "entrenador-ayudas");
  for (const a of mapa.areas) for (const x of usa(src, a, mapa.areas, decls)) assert.notEqual(x.area, a.id, `${a.id} se cita a sí misma por ${x.nombre}`);
});
console.log(`\n${ok} pasadas, ${mal} fallidas`); process.exit(mal ? 1 : 0);
