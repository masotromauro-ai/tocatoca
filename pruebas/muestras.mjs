// Prueba de las muestras reales del bandoneón (sin navegador ni npm): node pruebas/muestras.mjs
// Controla que el índice esté bien armado, que cada .wav exista y dure lo que dice, que los bucles caigan dentro
// de la muestra, que la costura del bucle no haga «tic», y que a cada botón del teclado (R01…, L01…) le corresponda una muestra, y que siga siendo la misma nota (lo que falta se informa, no falla).

import { readFileSync, existsSync } from "node:fs";
import { DEFS_L, DEFS_R } from "../src/shared/bandoneon/layouts.js";

const carpeta = new URL("../public/muestras/", import.meta.url);
const PC = { DO:0, "DO#":1, RE:2, "RE#":3, MI:4, FA:5, "FA#":6, SOL:7, "SOL#":8, LA:9, "LA#":10, SI:11 };
let fallos = 0;
const falla = (m) => { fallos++; console.log("✗ " + m); };

const idx = JSON.parse(readFileSync(new URL("indice.json", carpeta), "utf8"));
// El volumen percibido: la MISMA cuenta que nivel_percibido de pruebas/coser-muestras.py (si cambia una, cambia la otra)
const NIVEL = -21.0;
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k], vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
      } }
  }
}
function nivelPercibido(seg, sr) {
  const L = seg.length; let n = 1; while (n < L) n <<= 1;
  const re = new Float64Array(n), im = new Float64Array(n); let ww = 0;
  for (let i = 0; i < L; i++) { const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (L - 1)); re[i] = seg[i] / 32768 * w; ww += w * w; }
  fft(re, im);
  let suma = 0;
  for (let k = 0; k <= n / 2; k++) {
    const f = k * sr / n, f2 = f * f;
    const ra = (12194 ** 2 * f2 * f2) / ((f2 + 20.6 ** 2) * Math.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) * (f2 + 12194 ** 2)) * Math.pow(10, 2 / 20);
    const parl = 1 / Math.sqrt(1 + Math.pow(250 / Math.max(f, 1e-9), 8));
    const p = (re[k] * re[k] + im[k] * im[k]) * (ra * parl) ** 2;
    suma += (k === 0 || k === n / 2) ? p : 2 * p;
  }
  return 10 * Math.log10(suma / (n * ww) + 1e-20);
}

const claves = new Set();
const costuras = new Set();   // cada archivo se mira una vez (varios botones comparten muestra)

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
  // Cada muestra publicada tiene su grabación original, sin coser: el cosido se hace siempre desde ahí (MUESTRAS.md)
  if (!existsSync(new URL("../muestras-originales/" + m.archivo, import.meta.url))) falla(`${c}: falta su grabación original en muestras-originales/${m.archivo} (se cose desde ahí, MUESTRAS.md)`);
  const arch = new URL(m.archivo, carpeta);
  if (!existsSync(arch)) { falla(`${c}: falta el archivo ${m.archivo}`); continue; }
  const b = readFileSync(arch);
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WAVE") { falla(`${c}: no es un WAV`); continue; }
  const sr = b.readUInt32LE(24), canales = b.readUInt16LE(22), bits = b.readUInt16LE(34);
  const dur = (b.length - 44) / (sr * canales * (bits / 8));
  if (Math.abs(dur - m.duracion) > 0.02) falla(`${c}: dura ${dur.toFixed(2)} s y el índice dice ${m.duracion}`);
  if (!(m.loopStart >= 0 && m.loopEnd > m.loopStart && m.loopEnd <= dur + 0.001)) falla(`${c}: el bucle ${m.loopStart}–${m.loopEnd} no cabe en ${dur.toFixed(2)} s`);
  else if (m.loopEnd - m.loopStart < 0.5) falla(`${c}: bucle demasiado corto (se oiría como zumbido)`);
  else if (bits === 16 && canales === 1 && !costuras.has(m.archivo)) {
    // La costura del bucle: al volver del final al comienzo la onda no puede saltar más que lo que salta sola adentro del bucle.
    // Un salto se oye como un «tic» en cada vuelta mientras la tecla está apretada (22-nov-2026: 37 de 71 muestras lo tenían).
    // Se arregla con pruebas/coser-muestras.py, siempre desde las grabaciones originales (ver su cabecera: el tic, el volumen y el color).
    costuras.add(m.archivo);
    const x = new Int16Array(b.buffer.slice(b.byteOffset + 44, b.byteOffset + b.length - ((b.length - 44) % 2)));
    const s = Math.round(m.loopStart * sr), e = Math.round(m.loopEnd * sr);
    const d2 = (a, i) => Math.abs(a[i] - 2 * a[i - 1] + a[i - 2]);
    const dentro = []; for (let i = s + 2; i < e; i++) dentro.push(d2(x, i));
    dentro.sort((p, q) => p - q);
    const normal = dentro[Math.floor(dentro.length * 0.999)];
    const pegado = [x[e - 3], x[e - 2], x[e - 1], x[s], x[s + 1], x[s + 2]];
    let junta = 0; for (let i = 2; i < pegado.length; i++) junta = Math.max(junta, d2(pegado, i));
    if (junta > 2 * normal) falla(`${m.archivo}: la costura del bucle salta ${(junta / normal).toFixed(1)} veces lo normal (se oye un tic en cada vuelta)`);
    // Y el volumen: sostenida, alrededor de cada costura (±200 ms), no puede hundirse ni subir (22-nov-2026: la primera costura
    // fundía dos ondas que no coincidían, se restaban y el volumen caía al 16 % en cada vuelta: «un corte y continuación»).
    // Ventanas de 3 períodos (al menos 10 ms): más cortas, en las notas graves el volumen tiembla sólo por la fase.
    const z = []; for (let i = 0; i < e; i++) z.push(x[i]); for (let k = 0; k < 3; k++) for (let i = s; i < e; i++) z.push(x[i]);
    const f0 = 440 * Math.pow(2, (m.midi_referencia - 69) / 12) * Math.pow(2, (m.centesimas || 0) / 1200);
    const h = Math.max(Math.round(0.01 * sr), Math.round(3 * sr / f0));
    const rmsDe = (i) => { let a = 0; for (let j = i; j < i + h; j++) a += z[j] * z[j]; return Math.sqrt(a / h); };
    const bucle = []; for (let i = e; i + h < e + (e - s); i += h >> 1) bucle.push(rmsDe(i));
    bucle.sort((p, q) => p - q); const med = bucle[bucle.length >> 1];
    let vmin = Infinity, vmax = 0;
    for (const c of [e, 2 * e - s, 3 * e - 2 * s]) for (let i = c - Math.round(0.2 * sr); i < c + Math.round(0.2 * sr) && i + h < z.length; i += h >> 1) {
      const v = rmsDe(i) / med; vmin = Math.min(vmin, v); vmax = Math.max(vmax, v);
    }
    if (vmin < 0.8 || vmax > 1.25) falla(`${m.archivo}: sostenida, el volumen va de ${vmin.toFixed(2)} a ${vmax.toFixed(2)} al dar la vuelta (se oye un corte)`);
    // Y el COLOR (22-nov-2026, la tercera vez: «una caída y una subida repentina»): el nivel de los armónicos 1 a 6, cada 10 ms,
    // no puede cambiar al dar la vuelta más que lo que cambia solo en el resto de la nota. Se mide con Goertzel (sin FFT ni npm).
    const L = f0 < 110 ? 8192 : 4096, hann = new Float64Array(L).map((_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (L - 1)));
    const nivel = (i0, f) => { const w = 2 * Math.cos(2 * Math.PI * f / sr); let a = 0, b = 0;
      for (let i = 0; i < L; i++) { const c = z[i0 + i] * hann[i] + w * a - b; b = a; a = c; }
      return 10 * Math.log10(a * a + b * b - w * a * b + 1e-9); };
    const paso = Math.round(0.01 * sr), marcos = [];
    for (let i0 = Math.round(0.3 * sr); i0 + L < z.length; i0 += paso) marcos.push({ t: (i0 + L / 2) / sr, P: [1, 2, 3, 4, 5, 6].map((h) => nivel(i0, h * f0)) });
    const tipico = [0, 1, 2, 3, 4, 5].map((h) => { const v = marcos.map((q) => q.P[h]).sort((p, q) => p - q); return Math.pow(10, v[v.length >> 1] / 20); });
    const suma = tipico.reduce((p, q) => p + q, 0), peso = tipico.map((v) => v / suma);
    const vueltas = [e, 2 * e - s, 3 * e - 2 * s, 4 * e - 3 * s].map((c) => c / sr);
    const cerca = [], lejos = [];
    for (let k = 2; k < marcos.length; k++) {
      let d = 0; for (let h = 0; h < 6; h++) d += peso[h] * Math.min(15, Math.abs(marcos[k].P[h] - marcos[k - 2].P[h]));
      const tt = marcos[k - 1].t; if (tt < Math.max(0.4, s / sr)) continue;
      (vueltas.some((c) => Math.abs(c - tt) < 0.15) ? cerca : lejos).push(d);
    }
    lejos.sort((p, q) => p - q);
    const resto = lejos[Math.floor(lejos.length * 0.99)] ?? 0, costura = Math.max(...cerca);
    if (costura > 1.5 * resto + 0.4) falla(`${m.archivo}: al dar la vuelta el color cambia ${costura.toFixed(2)} dB (en el resto de la nota, ${resto.toFixed(2)}): se oye una caída y una subida`);
    // Y el VOLUMEN PERCIBIDO (22-nov-2026, Mauro: «algunas, sobre todo los bajos, suenan con muy poco volumen»): el tramo que se
    // repite, pesado con la curva A y el corte de un parlante de teléfono, tiene que estar a NIVEL ±1 dB (coser-muestras.py).
    const nv = nivelPercibido(x.subarray(s, e), sr);
    if (Math.abs(nv - NIVEL) > 1) falla(`${m.archivo}: suena ${(nv - NIVEL).toFixed(1)} dB respecto de las demás (se nivela con pruebas/coser-muestras.py)`);
  }
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
