// Prueba del banco de timbres (sin navegador ni npm): node pruebas/timbre.mjs
// Controla la regla que elige qué muestra del bandoneón suena para una nota cualquiera (entrenador, acordes, recorridos…)
// y cuánto se la estira, siempre en altura real (una octava sobre lo que escribe el teclado).

import { elegirMuestraPorAltura, OCTAVA_REAL, MAX_TRANSPOSICION, TIMBRES, getTimbre, setTimbre } from "../src/shared/audio/audio.js";

let fallos = 0;
const igual = (a, b, msg) => { if (Math.abs(a - b) > 1e-9) { fallos++; console.log(`✗ ${msg}: dio ${a}, esperaba ${b}`); } };
const sea = (cond, msg) => { if (!cond) { fallos++; console.log("✗ " + msg); } };

// Banco como el real: derecha abriendo, alturas reales 57–95 (el 94 no existe en el teclado)
const banco = new Map();
for (let m = 57; m <= 95; m++) if (m !== 94) banco.set(m, { id: m, pc: m % 12, rate: 1 });

sea(OCTAVA_REAL === 12, "la altura real es una octava sobre lo escrito");
const una = (midi) => elegirMuestraPorAltura(banco, midi);

// Nota escrita La2 (45) → La3 real (57): exacta y sin estirar
let r = una(45); sea(r && r.id === 57, "La2 usa la muestra 57"); igual(r.rate, 1, "La2 sin estirar");
// Nota escrita Si5 (83) → Si6 real (95)
r = una(83); sea(r && r.id === 95, "Si5 usa la muestra 95"); igual(r.rate, 1, "Si5 sin estirar");
// Todas las notas del teclado derecho (45–83, menos La♯5) suenan exactas
for (let m = 45; m <= 83; m++) { if (m === 82) continue; r = una(m); sea(r && r.id === m + 12 && r.rate === 1, `nota ${m} exacta`); }
// La♯5 escrita (82) → 94 real, que no se grabó: usa la vecina más grave y la sube un semitono
r = una(82); sea(r && r.id === 93, "La♯5 sale de la 93"); igual(r.rate, Math.pow(2, 1 / 12), "La♯5 sube un semitono");
// Un poco más grave que lo grabado: se estira hacia abajo hasta el límite
r = una(45 - MAX_TRANSPOSICION); sea(r && r.id === 57, "en el límite grave usa la 57"); igual(r.rate, Math.pow(2, -MAX_TRANSPOSICION / 12), "estirada hacia abajo");
sea(una(45 - MAX_TRANSPOSICION - 1) === null, "más allá del límite grave no usa muestra (suena el sintetizador)");
// Un poco más agudo
r = una(83 + MAX_TRANSPOSICION); sea(r && r.id === 95, "en el límite agudo usa la 95");
sea(una(83 + MAX_TRANSPOSICION + 1) === null, "más allá del límite agudo no usa muestra");
// Si la muestra ya viene con velocidad propia, se multiplica
const b2 = new Map([[60, { id: 60, rate: 0.5 }]]);
r = elegirMuestraPorAltura(b2, 48); igual(r.rate, 0.5, "respeta la velocidad propia");
// Sin banco o con banco vacío: null (suena el sintetizador)
sea(elegirMuestraPorAltura(undefined, 60) === null && elegirMuestraPorAltura(new Map(), 60) === null, "sin banco devuelve null");
// Con altura escrita (octavaReal 0) la nota 60 usa la muestra 60
r = elegirMuestraPorAltura(banco, 60, 0); sea(r && r.id === 60, "octavaReal 0 usa la misma altura");
// Timbres
sea(TIMBRES.includes("bandoneon") && TIMBRES.includes("sintetizador"), "hay timbre bandoneón y sintetizador");
sea(getTimbre() === "bandoneon", "el timbre por defecto es el bandoneón");
setTimbre("violin"); sea(getTimbre() === "bandoneon", "un timbre desconocido no cambia nada");
setTimbre("sintetizador"); sea(getTimbre() === "sintetizador", "se puede volver al sintetizador"); setTimbre("bandoneon");

console.log(fallos ? `\n${fallos} problema(s)` : "\n✓ banco de timbres en orden");
process.exitCode = fallos ? 1 : 0;
