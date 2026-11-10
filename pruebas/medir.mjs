// pruebas/medir.mjs — el resumen de práctica de cada día (public/cuenta/medir.js), con node a secas.
import assert from "node:assert/strict";
import { crearAcumulador, aDocumento, dia, clave, loDelTelefono, INACTIVO_MS } from "../public/cuenta/medir.js";
let ok = 0, mal = 0;
const t = (n, f) => { try { f(); ok++; } catch (e) { mal++; console.log("✖", n, e.message); } };
const inc = (n) => ({ inc: n });
t("el tiempo se suma a la herramienta que estaba en uso", () => {
  const a = crearAcumulador(); a.actividad(0); a.tic("codigo", 0); a.actividad(50000); a.tic("entrenador", 60000); a.actividad(100000); a.tic("entrenador", 120000);
  const p = a.vaciar(); assert.equal(p.min.codigo, 1); assert.equal(p.min.entrenador, 1);
});
t("sin actividad en 2 minutos, no cuenta", () => {
  const a = crearAcumulador(); a.actividad(0); a.tic("codigo", 0); a.tic("codigo", 60000); a.tic("codigo", 60000 + INACTIVO_MS + 1000);
  assert.equal(a.vaciar().min.codigo, 1);
});
t("con la página escondida no cuenta, y un teléfono dormido no suma horas", () => {
  const a = crearAcumulador(); a.actividad(0); a.tic("codigo", 0); a.tic("codigo", 30000, false); a.actividad(40 * 60000); a.tic("codigo", 40 * 60000); a.tic("codigo", 41 * 60000);
  assert.equal(a.vaciar().min.codigo, 0.5 + 1);
  const b = crearAcumulador(); b.actividad(10 * 3600e3); b.tic("x", 0); b.tic("x", 10 * 3600e3);
  assert.ok((b.vaciar().min.x || 0) <= 2);
});
t("aciertos y fallos por ejercicio y por nota", () => {
  const a = crearAcumulador(); a.resultado("Colores nota", true, 0); a.resultado("colores-nota", false, 0); a.resultado("colores-nota", false, 13); a.lote("entrenador-notas", 7, 3);
  const p = a.vaciar();
  assert.deepEqual(p.ej["colores-nota"], { a: 1, f: 2 }); assert.deepEqual(p.notas[0], { a: 1, f: 1 }); assert.equal(p.notas[13], undefined);
  assert.deepEqual(p.ej["entrenador-notas"], { a: 7, f: 3 });
});
t("al documento: sólo lo que hay, con incrementos y las claves que dejan las reglas", () => {
  const a = crearAcumulador(); a.ingreso(); a.resultado("x", true, 2); a.actividad(0); a.tic("codigo", 0); a.tic("codigo", 90000);
  const d = aDocumento(a.vaciar(), inc, 7);
  assert.deepEqual(Object.keys(d).sort(), ["ej", "en", "ingresos", "min", "notas"]);
  assert.deepEqual(d.min.codigo, { inc: 1.5 }); assert.deepEqual(d.ingresos, { inc: 1 }); assert.deepEqual(d.ej.x, { a: { inc: 1 } }); assert.equal(d.en, 7);
  assert.deepEqual(Object.keys(aDocumento(crearAcumulador().vaciar(), inc, 1)), ["en"]);
});
t("si mandar falla, nada se pierde", () => {
  const a = crearAcumulador(); a.resultado("x", true); a.ingreso(); const p = a.vaciar(); assert.ok(!a.hayAlgo()); a.devolver(p); a.resultado("x", false);
  const q = a.vaciar(); assert.deepEqual(q.ej.x, { a: 1, f: 1 }); assert.equal(q.ingresos, 1);
});
t("la fecha es la del día local; las claves, limpias", () => {
  assert.match(dia(Date.now()), /^\d{4}-\d{2}-\d{2}$/); assert.equal(clave("Mis Tareas!"), "mis-tareas"); assert.equal(clave(""), "");
});
t("traer lo del teléfono: tareas marcadas y acordes; nada si no hay", () => {
  const ls = { "bandomaps_hechas_ana": '{"c1":true,"c2":false}', "bandomaps_mis_acordes": '[{"n":"Dm7","b":[[1,2]]}]' };
  const r = loDelTelefono((k) => ls[k], "ana");
  assert.deepEqual(r.hechas, { c1: true, c2: false }); assert.equal(typeof r.misAcordesJson, "string");
  assert.equal(loDelTelefono(() => null, "ana"), null);
  assert.equal(loDelTelefono((k) => (k === "bandomaps_hechas_ana" ? '{"c1":false}' : "basura{"), "ana"), null);
});
// La app tiene que llamar a lo que mide. El 9-nov-2026 un App.jsx subido entero desde una copia vieja
// sacó medir(), medirLote() y window.__tab y devolvió las claves harmonia_: nada falló, sólo dejó de medirse.
import fs from "node:fs";
const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
t("App.jsx sigue llamando a medir y a medirLote, y avisa qué herramienta se usa", () => {
  assert.ok((app.match(/\bmedir\(/g) || []).length >= 3, "medir(");
  assert.ok(/medirLote\("entrenador-"/.test(app), "medirLote del Entrenador");
  assert.ok(app.includes("window.__tab=tab"), "window.__tab");
});
t("App.jsx no vuelve a guardar con las claves viejas harmonia_", () => assert.equal((app.match(/harmonia_/g) || []).length, 0));

console.log(`${ok} pasadas, ${mal} fallidas`); process.exit(mal ? 1 : 0);
