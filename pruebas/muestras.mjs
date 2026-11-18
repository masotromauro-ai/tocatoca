// Prueba de las muestras reales del bandoneón (sin navegador ni npm): node pruebas/muestras.mjs
// Controla que el índice esté bien armado, que cada .wav exista y dure lo que dice, que los bucles caigan dentro
// de la muestra, y que a cada botón del teclado le corresponda una muestra (lo que falta se informa, no falla).

import { readFileSync, existsSync } from "node:fs";
import { DEFS_L, DEFS_R } from "../src/shared/bandoneon/layouts.js";

const carpeta = new URL("../public/muestras/", import.meta.url);
const PC = { DO:0, "DO#":1, RE:2, "RE#":3, MI:4, FA:5, "FA#":6, SOL:7, "SOL#":8, LA:9, "LA#":10, SI:11 };
let fallos = 0;
const falla = (m) => { fallos++; console.log("✗ " + m); };

const idx = JSON.parse(readFileSync(new URL("indice.json", carpeta), "utf8"));
const claves = new Set();

for (const m of idx.muestras) {
  const c = `${m.mano}|${m.fuelle}|${m.midi}`;
  if (claves.has(c)) falla(`muestra repetida: ${c}`);
  claves.add(c);
  if (!["izq", "der"].includes(m.mano) || !["abre", "cierra"].includes(m.fuelle)) falla(`${c}: mano o fuelle desconocidos`);
  const arch = new URL(m.archivo, carpeta);
  if (!existsSync(arch)) { falla(`${c}: falta el archivo ${m.archivo}`); continue; }
  const b = readFileSync(arch);
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WAVE") { falla(`${c}: no es un WAV`); continue; }
  const sr = b.readUInt32LE(24), canales = b.readUInt16LE(22), bits = b.readUInt16LE(34);
  const dur = (b.length - 44) / (sr * canales * (bits / 8));
  if (Math.abs(dur - m.duracion) > 0.02) falla(`${c}: dura ${dur.toFixed(2)} s y el índice dice ${m.duracion}`);
  if (!(m.loopStart >= 0 && m.loopEnd > m.loopStart && m.loopEnd <= dur + 0.001)) falla(`${c}: el bucle ${m.loopStart}–${m.loopEnd} no cabe en ${dur.toFixed(2)} s`);
  else if (m.loopEnd - m.loopStart < 0.5) falla(`${c}: bucle demasiado corto (se oiría como zumbido)`);
}

// Cobertura contra el teclado real (Do4 = 60)
const midiDe = (nota, oct) => 12 * (Number(oct) + 1) + PC[nota];
function cobertura(defs, mano, fuelle) {
  const falta = [];
  for (const d of defs) {
    const midi = fuelle === "abre" ? midiDe(d.abre, d.oct_abre) : midiDe(d.cierra, d.oct_cierra);
    if (!claves.has(`${mano}|${fuelle}|${midi}`)) falta.push(d.id);
  }
  return falta;
}
for (const [defs, mano] of [[DEFS_R, "der"], [DEFS_L, "izq"]]) {
  for (const fuelle of ["abre", "cierra"]) {
    const falta = cobertura(defs, mano, fuelle);
    const tot = defs.length;
    console.log(`${mano}/${fuelle}: ${tot - falta.length} de ${tot} botones con muestra real${falta.length ? " (suenan con el sintetizador: " + falta.length + ")" : " ✓"}`);
  }
}

console.log(fallos ? `\n${fallos} problema(s)` : `\n✓ ${idx.muestras.length} muestras, índice y bucles en orden`);
process.exitCode = fallos ? 1 : 0;
