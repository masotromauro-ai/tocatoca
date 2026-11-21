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
igual(midis(sug("A", "m7", { mano: "izq" })), [33, 43, 48], "La m7 = La1 Sol2 Do3 (sin quinta, como la partitura)");
igual(midis(sug("C", "M", { mano: "izq" })), [24, 43, 52], "Do = Do1 Sol2 Mi3");

// ── Izquierda, cerrada: los 8 acordes de la partitura (bajo + séptima y tercera juntas, entre Sol2 y Fa3)
REGLAS_VOICING.quintaEnMenor7 = false;   // la partitura y el profesor: sin quinta en los menores con séptima (es el valor por defecto)
igual(midis(sug("D", "m7", { mano: "izq" })), [26, 48, 53], "Re m7");
igual(midis(sug("G", "dom7", { mano: "izq" })), [31, 47, 53], "Sol 7");
igual(midis(sug("C", "maj7", { mano: "izq" })), [24, 47, 52], "Do △7");
igual(midis(sug("F", "maj7", { mano: "izq" })), [29, 45, 52], "Fa △7");
igual(midis(sug("B", "hdim", { mano: "izq" })), [35, 45, 50], "Si ø7");
igual(midis(sug("E", "dom7", { mano: "izq" })), [28, 44, 50], "Mi 7");
igual(midis(sug("A", "m7", { mano: "izq" })), [33, 43, 48], "La m7");
igual(midis(sug("A", "dom7", { mano: "izq" })), [33, 43, 49], "La 7");
REGLAS_VOICING.quintaEnMenor7 = true;
igual(midis(sug("D", "m7", { mano: "izq" })), [26, 45, 48, 53], "Re m7 con la quinta si se activa esa regla");
REGLAS_VOICING.quintaEnMenor7 = false;
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
igual(midis(ab, "der"), [52, 59], "Do △7 abierto: Mi3 y Si3 a la derecha, igual que la cerrada");
if (ab.forma !== "abierta") falla("la forma abierta se informa como abierta");
// la derecha no se va una octava arriba: en la 1ª forma, cerrada o abierta, ninguna nota pasa del Do4 (60)
for (const forma of ["cerrada", "abierta"]) for (const r of CROM) for (const t of Object.keys(TIPOS)) {
  const top = Math.max(...midis(sug(r, t, { mano: "ambas", forma }), "der"));
  if (top > 60) falla(`${r} ${t} ${forma}: la derecha llega a ${top}`);
}
// abierta solo existe con las dos manos
if (sug("C", "maj7", { mano: "izq", forma: "abierta" }).forma !== "cerrada") falla("con una sola mano la forma es cerrada");

// ── Derecha sola
igual(midis(sug("C", "M", { mano: "der" })), [48, 52, 55], "Do mayor en la derecha");
igual(midis(sug("C", "M", { mano: "der", inv: 1 })), [52, 55, 60], "Do mayor en la derecha, 1ª inversión");
igual(sug("C", "maj7", { mano: "izq" }).variantes, 6, "seis formas para Do △7 a la izquierda");

// ── «Otra forma»: bajo en Do1 o Do2, la otra inversión, y después las octavas más agudas
const forma = (r, t, opc, i) => sug(r, t, { ...opc, inv: i });
igual(sug("C", "M", { mano: "izq" }).variantes, 4, "Do mayor a la izquierda: cuatro formas");
igual(midis(forma("C", "M", { mano: "izq" }, 0)), [24, 43, 52], "Do = Do1 Sol2 Mi3");
igual(midis(forma("C", "M", { mano: "izq" }, 2)), [36, 43, 52], "Do = Do2 Sol2 Mi3 (bajo una octava arriba)");
igual(midis(forma("C", "maj7", { mano: "izq" }, 1)), [36, 47, 52], "Do △7 = Do2 Si2 Mi3 (bajo una octava arriba)");
igual(midis(forma("C", "maj7", { mano: "ambas" }, 0), "der"), [52, 59], "Do △7, dos manos: Mi3 Si3");
igual(midis(forma("C", "maj7", { mano: "ambas" }, 1), "der"), [47, 52], "Do △7, dos manos: Si2 Mi3");
igual(midis(forma("C", "maj7", { mano: "ambas" }, 4), "izq"), [36], "Do △7, dos manos, bajo en Do2");
igual(midis(forma("C", "maj7", { mano: "ambas" }, 6), "der"), [64, 71], "Do △7, dos manos, versión más aguda");
if (forma("C", "maj7", { mano: "izq" }, 0).desc !== "") falla("la recomendada no lleva descripción");
if (!forma("C", "maj7", { mano: "izq" }, 1).desc.includes("octava")) falla("la 2ª forma se describe");
for (const [r, t, o] of [["C", "M", { mano: "izq" }], ["D", "m7", { mano: "izq" }], ["G", "dom7", { mano: "ambas" }], ["A", "m", { mano: "der" }], ["C", "maj7", { mano: "ambas", forma: "abierta" }]]) {
  const n = sug(r, t, o).variantes, vistas = new Set();
  for (let i = 0; i < n; i++) {
    const x = sug(r, t, { ...o, inv: i }); vistas.add(x.notas.map((k) => k.b).sort().join());
    if (x.faltan.length) falla(`${r} ${t} ${o.mano}: la forma ${i + 1} tiene faltantes`);
    const iz = midis(x, "izq"); for (let k = 1; k < iz.length; k++) if (iz[k] <= iz[k - 1]) falla(`${r} ${t}: forma ${i + 1} no sube a la izquierda`);
  }
  if (vistas.size !== n) falla(`${r} ${t} ${o.mano}: hay formas repetidas`);
}

// ── Menores: La m, La m7, el La2 como bajo opcional y la quinta como relleno
igual(midis(forma("A", "m", { mano: "izq" }, 0)), [33, 48, 52], "La m = La1 Do3 Mi3");
igual(midis(forma("A", "m", { mano: "izq" }, 1)), [45, 48, 52], "La m con el bajo en La2");
igual(midis(forma("A", "m7", { mano: "izq" }, 0)), [33, 43, 48], "La m7 = La1 Sol2 Do3");
igual(midis(forma("A", "m7", { mano: "izq" }, 2)), [43, 45, 48], "La m7 con el bajo en La2 (Sol2 La2 Do3)");
igual(midis(forma("A", "m7", { mano: "izq" }, 4)), [33, 43, 48, 52], "La m7 con la quinta, como relleno");
if (!forma("A", "m7", { mano: "izq" }, 4).desc.includes("quinta")) falla("la forma con quinta se describe");

// ── Extensiones: a la izquierda quedan como opcional; a la derecha son una nota más; siempre se pueden armar
const EXT = {
  maj9: [["R", 0], ["3", 4], ["5", 7], ["7", 11], ["9", 2]], dom9: [["R", 0], ["3", 4], ["5", 7], ["b7", 10], ["9", 2]],
  m9: [["R", 0], ["b3", 3], ["5", 7], ["b7", 10], ["9", 2]], seis: [["R", 0], ["3", 4], ["5", 7], ["6", 9]],
  sus4: [["R", 0], ["4", 5], ["5", 7]], dom13: [["R", 0], ["3", 4], ["5", 7], ["b7", 10], ["13", 9]],
};
const tonosE = (raiz, tipo) => EXT[tipo].map(([raw, iv]) => { const n = CROM[(CROM.indexOf(raiz) + iv) % 12]; return { raw, lab: raw, pc: n, esc: n, nombre: n }; });
const o9 = sugerirVoicing(T, tonosE("C", "maj9"), { mano: "izq" });
if (!o9.opcional.some((x) => x.includes("derecha"))) falla("la 9ª a la izquierda se ofrece para la derecha");
igual(midis(o9), [24, 47, 52], "Do △9 a la izquierda: bajo, séptima y tercera");
if (!midis(sugerirVoicing(T, tonosE("C", "maj9"), { mano: "ambas" }), "der").some((m) => m % 12 === 2)) falla("la 9ª va en la derecha");
let sinE = [];
for (const r of CROM) for (const t of Object.keys(EXT)) for (const mano of ["izq", "der", "ambas"]) {
  const x = sugerirVoicing(T, tonosE(r, t), { mano });
  if (x.faltan.length || !x.notas.length) sinE.push(`${r} ${t} ${mano}`);
}
if (sinE.length) falla(`extensiones que no se arman: ${sinE.slice(0, 8).join(", ")}`);

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
