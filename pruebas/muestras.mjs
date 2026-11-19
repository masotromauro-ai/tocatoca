// Prueba de las muestras reales del bandoneón (sin navegador ni npm): node pruebas/muestras.mjs
// Controla que el índice esté bien armado, que cada .wav exista y dure lo que dice, que los bucles caigan dentro
// de la muestra, y que a cada botón del teclado (R01…, L01…) le corresponda una muestra, y que siga siendo la misma nota (lo que falta se informa, no falla).

import { readFileSync, existsSync } from "node:fs";
import { DEFS_L, DEFS_R } from "../src/shared/bandoneon/layouts.js";

const carpeta = new URL("../public/muestras/", import.meta.url);
const PC = { DO:0, "DO#":1, RE:2, "RE#":3, MI:4, FA:5, "FA#":6, SOL:7, "SOL#":8, LA:9, "LA#":10, SI:11 };
let fallos = 0;
const falla = (m) => { fallos++; console.log("✗ " + m); };

const idx = JSON.parse(readFileSync(new URL("indice.json", carpeta), "utf8"));
const claves = new Set();

for (const m of idx.muestras) {
  const c = `${m.mano}|${m.fuelle}|${m.boton}`;
  if (claves.has(c)) falla(`muestra repetida: ${c}`);
  claves.add(c);
  if (!["izq", "der"].includes(m.mano) || !["abre", "cierra"].includes(m.fuelle)) falla(`${c}: mano o fuelle desconocidos`);
  const defs = m.mano === "der" ? DEFS_R : DEFS_L;
  const d = defs.find((x) => x.id === m.boton);
  if (!d) falla(`${c}: el botón ${m.boton} no existe en el teclado de fábrica`);
  else if (PC[m.fuelle === "abre" ? d.abre : d.cierra] !== m.pc) falla(`${c}: el botón de fábrica es otra nota (pc ${PC[m.fuelle === "abre" ? d.abre : d.cierra]}, la muestra es pc ${m.pc})`);
  if (m.velocidad !== undefined && !(m.velocidad >= 0.4 && m.velocidad <= 2.5)) falla(`${c}: velocidad fuera de rango (${m.velocidad})`);
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

// Cobertura contra el teclado de fábrica: cada botón tiene que tener su muestra
function cobertura(defs, mano, fuelle) {
  return defs.filter((d) => !claves.has(`${mano}|${fuelle}|${d.id}`)).map((d) => d.id);
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
