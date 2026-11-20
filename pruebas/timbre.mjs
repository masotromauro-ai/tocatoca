// Prueba del banco de timbres (sin navegador ni npm): node pruebas/timbre.mjs
// Controla la regla que elige qué muestra del bandoneón suena para una nota cualquiera (entrenador, acordes, recorridos…)
// y cuánto se la estira, siempre en altura real (una octava sobre lo que escribe el teclado).

import { elegirMuestraPorAltura, OCTAVA_REAL, MAX_TRANSPOSICION, TIMBRES, getTimbre, setTimbre } from "../src/shared/audio/audio.js";

let fallos = 0;
const igual = (a, b, msg) => { if (Math.abs(a - b) > 1e-9) { fallos++; console.log(`✗ ${msg}: dio ${a}, esperaba ${b}`); } };
const sea = (cond, msg) => { if (!cond) { fallos++; console.log("✗ " + msg); } };

// Banco como el real: abriendo, izquierda y derecha juntas, alturas reales 36–95 (el 37 y el 94 no existen en el teclado)
const banco = new Map();
for (let m = 36; m <= 95; m++) if (m !== 37 && m !== 94) banco.set(m, { id: m, pc: m % 12, rate: 1 });

sea(OCTAVA_REAL === 12, "la altura real es una octava sobre lo escrito");
const una = (midi) => elegirMuestraPorAltura(banco, midi);

// Nota escrita Do1 (24), la más grave de la izquierda → Do2 real (36): exacta y sin estirar
let r = una(24); sea(r && r.id === 36, "Do1 usa la muestra 36"); igual(r.rate, 1, "Do1 sin estirar");
// Nota escrita Si5 (83), la más aguda de la derecha → Si6 real (95)
r = una(83); sea(r && r.id === 95, "Si5 usa la muestra 95"); igual(r.rate, 1, "Si5 sin estirar");
// Todas las notas escritas de 24 a 83 suenan exactas, salvo las dos que no existen en el teclado
for (let m = 24; m <= 83; m++) { if (m === 25 || m === 82) continue; r = una(m); sea(r && r.id === m + 12 && r.rate === 1, `nota ${m} exacta`); }
// Do♯1 escrita (25) → 37 real, que no existe: usa la vecina más grave y la sube un semitono
r = una(25); sea(r && r.id === 36, "Do♯1 sale de la 36"); igual(r.rate, Math.pow(2, 1 / 12), "Do♯1 sube un semitono");
// La♯5 escrita (82) → 94 real, que no existe: usa la 93 y la sube un semitono
r = una(82); sea(r && r.id === 93, "La♯5 sale de la 93"); igual(r.rate, Math.pow(2, 1 / 12), "La♯5 sube un semitono");
// Más grave o más agudo que lo grabado: se estira hasta el límite
r = una(24 - MAX_TRANSPOSICION); sea(r && r.id === 36, "en el límite grave usa la 36"); igual(r.rate, Math.pow(2, -MAX_TRANSPOSICION / 12), "estirada hacia abajo");
sea(una(24 - MAX_TRANSPOSICION - 1) === null, "más allá del límite grave no usa muestra (suena el sintetizador)");
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
