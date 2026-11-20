// Prueba del voicing sugerido (sin navegador ni npm): node pruebas/voicing-sugerido.mjs
// Controla que las formas recomendadas salgan como en la partitura «Práctica Armónica 1» y como las definió el profesor,
// y que en las doce tonalidades siempre se pueda armar el acorde en el teclado real.

import { sugerirVoicing, REGLAS_VOICING, nombreAltura } from "../src/shared/bandoneon/acorde.js";
import { itemsMano } from "../src/shared/bandoneon/tablas.js";
import { DEFS_L, DEFS_R } from "../src/shared/bandoneon/layouts.js";

let fallos = 0;
const falla = (m) => { fallos++; console.log("✗ " + m); };
const igual = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) falla(`${m}: dio ${JSON.stringify(a)}, esperaba ${JSON.stringify(b)}`); };

const CROM = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const TIPOS = {
  maj7: [["R", 0], ["3", 4], ["5", 7], ["7", 11]], dom7: [["R", 0], ["3", 4], ["5", 7], ["b7", 10]],
  m7: [["R", 0], ["b3", 3], ["5", 7], ["b7", 10]], hdim: [["R", 0], ["b3", 3], ["b5", 6], ["b7", 10]],
  M: [["R", 0], ["3", 4], ["5", 7]], m: [["R", 0], ["b3", 3], ["5", 7]],
};
const tonos = (raiz, tipo) => TIPOS[tipo].map(([raw, iv]) => { const n = CROM[(CROM.indexOf(raiz) + iv) % 12]; return { raw, lab: raw, pc: n, esc: n, nombre: n }; });
const teclado = (fuelle) => ({ izq: itemsMano(DEFS_L, fuelle), der: itemsMano(DEFS_R, fuelle) });
const T = teclado("abre");
const midis = (r, mano) => r.notas.filter((n) => !mano || n.mano === mano).map((n) => n.midi);
const sug = (raiz, tipo, opc, tk = T) => sugerirVoicing(tk, tonos(raiz, tipo), opc);

// ── Izquierda, cerrada: los ejemplos que ya había definido el profesor (alturas como las escribe el teclado: Do1 = 24)
igual(midis(sug("C", "maj7", { mano: "izq" })), [24, 47, 52], "Do△7 = Do1 Si2 Mi3");
igual(midis(sug("C", "dom7", { mano: "izq" })), [24, 46, 52], "Do7 = Do1 La♯2 Mi3");
igual(midis(sug("A", "m", { mano: "izq" })), [33, 48, 52], "La m = La1 Do3 Mi3");
igual(midis(sug("A", "m7", { mano: "izq" })), [33, 43, 48, 52], "La m7 = La1 Sol2 Do3 Mi3");
igual(midis(sug("C", "M", { mano: "izq" })), [24, 43, 52], "Do = Do1 Sol2 Mi3");

// ── Izquierda, cerrada: los 8 acordes de la partitura (bajo + séptima y tercera juntas, entre Sol2 y Fa3)
REGLAS_VOICING.quintaEnMenor7 = false;   // la partitura no pone quinta en los menores con séptima
igual(midis(sug("D", "m7", { mano: "izq" })), [26, 48, 53], "Re m7");
igual(midis(sug("G", "dom7", { mano: "izq" })), [31, 47, 53], "Sol 7");
igual(midis(sug("C", "maj7", { mano: "izq" })), [24, 47, 52], "Do △7");
igual(midis(sug("F", "maj7", { mano: "izq" })), [29, 45, 52], "Fa △7");
igual(midis(sug("B", "hdim", { mano: "izq" })), [35, 45, 50], "Si ø7");
igual(midis(sug("E", "dom7", { mano: "izq" })), [28, 44, 50], "Mi 7");
igual(midis(sug("A", "m7", { mano: "izq" })), [33, 43, 48], "La m7");
igual(midis(sug("A", "dom7", { mano: "izq" })), [33, 43, 49], "La 7");
REGLAS_VOICING.quintaEnMenor7 = true;
igual(midis(sug("D", "m7", { mano: "izq" })), [26, 45, 48, 53], "Re m7 con quinta (regla del profesor)");
const op = sug("B", "hdim", { mano: "izq" }).opcional;
if (op.length !== 1 || !op[0].includes("b5")) falla("el Si ø7 ofrece la 5ª♭ como opcional: " + JSON.stringify(op));

// ── Las dos manos, cerrada: bajo a la izquierda; tercera y séptima a la derecha (Do3 a Do4)
const ambas = (r, t) => { const x = sug(r, t, { mano: "ambas", forma: "cerrada" }); return [midis(x, "izq"), midis(x, "der")]; };
igual(ambas("D", "m7"), [[26], [48, 53]], "Re m7, dos manos");
igual(ambas("G", "dom7"), [[31], [53, 59]], "Sol 7, dos manos");
igual(ambas("C", "maj7"), [[24], [52, 59]], "Do △7, dos manos");
igual(ambas("F", "maj7"), [[29], [52, 57]], "Fa △7, dos manos");
igual(ambas("B", "hdim"), [[35], [50, 57]], "Si ø7, dos manos");
igual(ambas("E", "dom7"), [[28], [50, 56]], "Mi 7, dos manos");
igual(ambas("A", "m7"), [[33], [55, 60]], "La m7, dos manos");
igual(ambas("A", "dom7"), [[33], [49, 55]], "La 7, dos manos");
// la otra inversión de la partitura (Re m7 con la 3ª abajo y La m7 con la 3ª abajo)
igual(midis(sug("D", "m7", { mano: "ambas", inv: 1 }), "der"), [53, 60], "Re m7, otra forma");
igual(midis(sug("A", "m7", { mano: "ambas", inv: 1 }), "der"), [48, 55], "La m7, otra forma");

// ── Las dos manos, abierta: bajo y quinta a la izquierda; tercera y séptima a la derecha
const ab = sug("C", "maj7", { mano: "ambas", forma: "abierta" });
igual(midis(ab, "izq"), [24, 31], "Do △7 abierto: bajo y quinta a la izquierda");
igual(midis(ab, "der"), [59, 64], "Do △7 abierto: Si3 y Mi4 a la derecha");
if (ab.forma !== "abierta") falla("la forma abierta se informa como abierta");
// abierta solo existe con las dos manos
if (sug("C", "maj7", { mano: "izq", forma: "abierta" }).forma !== "cerrada") falla("con una sola mano la forma es cerrada");

// ── Derecha sola
igual(midis(sug("C", "M", { mano: "der" })), [48, 52, 55], "Do mayor en la derecha");
igual(midis(sug("C", "M", { mano: "der", inv: 1 })), [52, 55, 60], "Do mayor en la derecha, 1ª inversión");
igual(sug("C", "maj7", { mano: "izq" }).variantes, 2, "dos formas para Do △7");

// ── Faltantes: si el teclado no tiene la fundamental, se avisa
const sinRaiz = { izq: T.izq.filter((i) => i.pc !== 0), der: T.der };
if (!sugerirVoicing(sinRaiz, tonos("C", "maj7"), { mano: "izq" }).faltan.some((f) => f.includes("bajo"))) falla("avisa si falta el bajo");
igual(sugerirVoicing({ izq: [], der: [] }, tonos("C", "maj7"), { mano: "izq" }).notas, [], "sin teclas no hay notas");

// ── Las doce tonalidades y los tipos más usados: siempre se puede armar, abriendo, y el orden es de grave a agudo
let sinArmar = [];
for (const r of CROM) for (const t of Object.keys(TIPOS)) for (const [mano, forma] of [["izq", "cerrada"], ["der", "cerrada"], ["ambas", "cerrada"], ["ambas", "abierta"]]) {
  const x = sug(r, t, { mano, forma });
  if (x.faltan.length || !x.notas.length) sinArmar.push(`${r} ${t} ${mano}/${forma}`);
  const izq = midis(x, "izq"); for (let i = 1; i < izq.length; i++) if (izq[i] <= izq[i - 1]) falla(`${r} ${t} ${mano}: la izquierda no sube`);
  const der = midis(x, "der"); for (let i = 1; i < der.length; i++) if (der[i] <= der[i - 1]) falla(`${r} ${t} ${mano}: la derecha no sube`);
  if (new Set(x.notas.map((n) => n.b)).size !== x.notas.length) falla(`${r} ${t} ${mano}: repite una tecla`);
}
if (sinArmar.length) falla(`no se pudo armar abriendo: ${sinArmar.join(", ")}`);

// ── Cerrando: cuántos se arman (informativo; el fuelle cierra tiene menos notas)
const C = teclado("cierra"); let ok = 0, tot = 0, noCierra = [];
for (const r of CROM) for (const t of Object.keys(TIPOS)) for (const mano of ["izq", "der", "ambas"]) { tot++; const x = sug(r, t, { mano }, C); if (x.faltan.length) noCierra.push(`${r} ${t} ${mano}`); else ok++; }
console.log(`cerrando: ${ok} de ${tot} combinaciones se arman completas${noCierra.length ? " (faltan: " + noCierra.slice(0, 6).join(", ") + (noCierra.length > 6 ? "…" : "") + ")" : ""}`);
console.log(`zona de la izquierda con este teclado: ${nombreAltura(24 + 18)}–${nombreAltura(24 + 30)}`);

console.log(fallos ? `\n${fallos} problema(s)` : "\n✓ voicing sugerido en orden");
process.exitCode = fallos ? 1 : 0;
