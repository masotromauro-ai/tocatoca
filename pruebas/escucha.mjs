// pruebas/escucha.mjs — la escucha por micrófono en su hilo (fase 7 de ARQUITECTURA.md, 17-nov-2026), con node a
// secas. Lo que cuida: que el espectro sea el MISMO que daba el AnalyserNode (si no, micEstimar detectaría otra
// cosa), que el worklet detecte un acorde de verdad, y que su código salga de las mismas funciones (una copia).
import assert from "node:assert/strict";
import vm from "node:vm";
import { fftEnLugar, espectroComoAnalizador, micEstimar, fuenteWorklet } from "../src/shared/audio/mic.js";
let ok = 0, mal = 0;
const t = (n, f) => { try { f(); ok++; } catch (e) { mal++; console.log("✖", n, e.message); } };
const cerca = (a, b, tol) => Math.abs(a - b) <= tol;

t("la FFT da lo mismo que la cuenta directa (DFT)", () => {
  const N = 64, x = Float32Array.from({ length: N }, (_, i) => Math.sin(i * 1.3) + 0.5 * Math.cos(i * 0.37) + (i % 7) / 10);
  const re = Float32Array.from(x), im = new Float32Array(N); fftEnLugar(re, im);
  for (let k = 0; k < N; k++) {
    let r = 0, m = 0; for (let n = 0; n < N; n++) { r += x[n] * Math.cos(2 * Math.PI * k * n / N); m -= x[n] * Math.sin(2 * Math.PI * k * n / N); }
    assert.ok(cerca(re[k], r, 1e-3) && cerca(im[k], m, 1e-3), `k=${k}`);
  }
});
t("el espectro tiene la escala del AnalyserNode: un seno de amplitud 1 da 0,21 (Blackman: a0/2)", () => {
  const N = 4096, k0 = 200, x = Float32Array.from({ length: N }, (_, n) => Math.sin(2 * Math.PI * k0 * n / N));
  const mag = espectroComoAnalizador(x, null, 0.3);
  assert.ok(cerca(mag[k0], 0.21, 0.002), String(mag[k0]));
  assert.ok(mag[k0 + 10] < 1e-3);
});
t("el suavizado entre cuadros es el de la especificación: τ·anterior + (1−τ)·actual", () => {
  const N = 1024, x = Float32Array.from({ length: N }, (_, n) => Math.sin(2 * Math.PI * 50 * n / N));
  const uno = espectroComoAnalizador(x, null, 0.3), dos = espectroComoAnalizador(new Float32Array(N), uno, 0.3);
  assert.ok(cerca(dos[50], 0.3 * uno[50], 1e-6));
});

// Un acorde de lengüetas: cada nota con armónicos que bajan, como el bandoneón
const SR = 44100, N = 16384;
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const acorde = (notas, largo, desde = 0) => Float32Array.from({ length: largo }, (_, i) => {
  const tt = (i + desde) / SR; let v = 0;
  for (const m of notas) for (let h = 1; h <= 5; h++) v += (0.12 / h) * Math.sin(2 * Math.PI * hz(m) * h * tt);
  return v; });
const CANDS = new Set(Array.from({ length: 40 }, (_, i) => 45 + i));

t("con el espectro nuevo, micEstimar encuentra el acorde (Do–Mi–Sol)", () => {
  const mag = espectroComoAnalizador(acorde([60, 64, 67], N), null, 0.3);
  assert.deepEqual(micEstimar(mag, SR, N, CANDS, 5), [60, 64, 67]);
});
t("y una nota sola, en modo nota", () => {
  const mag = espectroComoAnalizador(acorde([57], N), null, 0.3);
  assert.deepEqual(micEstimar(mag, SR, N, CANDS, 1), [57]);
});

t("el worklet: corre entero, de a 128 muestras como el navegador, y detecta el acorde", () => {
  const enviados = []; let proc = null;
  const ctx = {
    sampleRate: SR, Math, Float32Array, Map, Set, Array,
    AudioWorkletProcessor: class { constructor() { this.port = { postMessage: (m) => enviados.push(m), onmessage: null }; } },
    registerProcessor: (nombre, C) => { assert.equal(nombre, "escucha-bandomaps"); proc = new C(); },
  };
  vm.runInNewContext(fuenteWorklet(), ctx);
  proc.port.onmessage({ data: { cands: [...CANDS], maxN: 5 } });
  const total = N + 4 * Math.round(SR * 0.07);
  for (let i = 0; i < total; i += 128) proc.process([[acorde([62, 66, 69], 128, i)]]);
  assert.ok(enviados.length >= 3, `mandó ${enviados.length}`);
  assert.deepEqual([...enviados[enviados.length - 1]], [62, 66, 69]);
});
t("el worklet no manda nada hasta juntar un cuadro entero, y sin entrada no se cae", () => {
  const enviados = []; let proc = null;
  vm.runInNewContext(fuenteWorklet(), { sampleRate: SR, Math, Float32Array, Map, Set, Array,
    AudioWorkletProcessor: class { constructor() { this.port = { postMessage: (m) => enviados.push(m) }; } },
    registerProcessor: (_n, C) => { proc = new C(); } });
  for (let i = 0; i < N - 256; i += 128) proc.process([[new Float32Array(128)]]);
  assert.equal(enviados.length, 0);
  assert.equal(proc.process([[]]), true);
  assert.equal(proc.process([]), true);
});
t("el código del worklet sale de las mismas funciones de mic.js (una sola copia de la lógica)", () => {
  const f = fuenteWorklet();
  for (const fn of [fftEnLugar, espectroComoAnalizador, micEstimar]) assert.ok(f.includes(String(fn)), fn.name);
  assert.match(f, /registerProcessor\("escucha-bandomaps"/);
});

console.log(`${ok} pasadas, ${mal} fallidas`);
process.exit(mal ? 1 : 0);
