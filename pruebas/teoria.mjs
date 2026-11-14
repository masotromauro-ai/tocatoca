// pruebas/teoria.mjs — la teoría y las formas recomendadas, sin pantalla (fase 1 de ARQUITECTURA.md). Sin npm ni red:  node pruebas/teoria.mjs
import assert from "node:assert/strict";
import { noteIdx, spell, buildScale, nombreLat, LAT } from "../src/shared/teoria/notas.js";
import { NC, nc } from "../src/shared/teoria/color.js";
import { parseChord } from "../src/shared/teoria/acordes.js";
import { itemsMano } from "../src/shared/bandoneon/tablas.js";
import { voicingsDe, PATRONES_VOZ } from "../src/shared/bandoneon/voicings.js";
let ok = 0, mal = 0;
const t = (n, f) => { try { f(); ok++; console.log("  ✓ " + n); } catch (e) { mal++; console.log("  ✗ " + n + "\n      " + e.message); } };

t("las notas se escriben según la tonalidad: en La mayor, Do♯ y no Re♭", () => {
  assert.deepEqual(buildScale("A", [0, 2, 4, 5, 7, 9, 11]), ["A", "B", "C#", "D", "E", "F#", "G#"]);
  assert.deepEqual(buildScale("Db", [0, 2, 4, 5, 7, 9, 11]), ["Db", "Eb", "F", "Gb", "Ab", "Bb", "C"]);
  assert.equal(spell("A", 4, 2), "C#");
});
t("noteIdx entiende sostenidos, bemoles y lo inválido", () => {
  assert.equal(noteIdx("C#"), 1); assert.equal(noteIdx("Db"), 1); assert.equal(noteIdx("Bb"), 10); assert.equal(noteIdx("H"), -1);
});
t("nombres en español con símbolos", () => { assert.equal(nombreLat("Bb"), "Si♭"); assert.equal(nombreLat("F#"), "Fa♯"); assert.equal(LAT.SOL, "G"); });
t("la paleta oficial tiene las doce notas con su color", () => {
  assert.equal(Object.keys(NC).length >= 12, true);
  for (const k of Object.keys(NC)) assert.match(JSON.stringify(NC[k]), /#[0-9a-fA-F]{6}/, k);
  assert.equal(typeof nc, "function");
});
t("parseChord: Cmaj7 y G7", () => {
  assert.deepEqual(parseChord("Cmaj7").notes, ["C", "E", "G", "B"]);
  assert.ok(parseChord("G7").notes.includes("F")); assert.equal(parseChord("???"), null);
});
t("itemsMano da la altura real de cada botón según el fuelle", () => {
  const it = itemsMano([{ id: "a", abre: "DO", cierra: "RE", oct_abre: 2, oct_cierra: 3 }], "abre");
  assert.equal(it[0].pc, 0); assert.equal(it[0].oct, 2); assert.equal(it[0].midi, 36);
  assert.equal(itemsMano([{ id: "a", abre: "DO", cierra: "RE", oct_abre: 2, oct_cierra: 3 }], "cierra")[0].midi, 50);
});
// Un teclado de mentira: bajo y 5ª a la izquierda, 3ª y 7ª a la derecha
const L = [{ id: "L1", abre: "DO", oct_abre: 2, x: 0, y: 0 }, { id: "L2", abre: "SOL", oct_abre: 2, x: 1, y: 0 }];
const R = [{ id: "R1", abre: "MI", oct_abre: 3, x: 5, y: 0 }, { id: "R2", abre: "SI", oct_abre: 3, x: 6, y: 0 }];
t("formas recomendadas: tres patrones, y el abierto pone el bajo y la 5ª a la izquierda y la 3ª y la 7ª a la derecha", () => {
  const v = voicingsDe([0, 4, 7, 11], ["Do", "Mi", "Sol", "Si"], L, R, "abre");
  assert.deepEqual(v.map((x) => x.id), PATRONES_VOZ.map((x) => x.id));
  const ab = v.find((x) => x.id === "abierto");
  assert.deepEqual(ab.ids.slice().sort(), ["L1", "L2", "R1", "R2"]); assert.deepEqual(ab.manos, { L: 2, R: 2 });
  assert.equal(ab.notas.find((n) => n.rol === 0).id, "L1");
});
t("si el teclado no tiene la forma, el patrón dice vacío (no inventa)", () => {
  const v = voicingsDe([0, 4, 7, 11], ["Do", "Mi", "Sol", "Si"], L, R, "abre");
  assert.equal(v.find((x) => x.id === "marcato").vacio, true);   // el marcato pide 3ª y 7ª a la izquierda, y acá están a la derecha
});
t("es determinista: dos corridas dan lo mismo", () =>
  assert.deepEqual(voicingsDe([0, 4, 7], ["Do", "Mi", "Sol"], L, R, "abre"), voicingsDe([0, 4, 7], ["Do", "Mi", "Sol"], L, R, "abre")));
console.log(`\n${ok} pasadas, ${mal} fallidas`); process.exit(mal ? 1 : 0);
