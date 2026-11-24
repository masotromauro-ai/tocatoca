// El sonido de la pestaña Ejecución. Toca igual que el de la pestaña Bandoneón (las mismas muestras reales y, si falta
// alguna, el sintetizador de siempre), pero todas las notas pasan por un «fuelle» común que tiene PRESIÓN:
// más presión = más volumen y un timbre más abierto; menos presión = más suave, más apagado y con la entrada de la nota
// un poco más lenta (como una lengüeta que tarda en hablar). La presión se puede mover mientras la nota suena,
// y así salen las notas tenidas con crescendo y diminuendo. No modifica hooks.jsx ni audio.js: solo los usa.

import { useRef, useCallback, useEffect } from "react";
import { getCtx, buscarMuestra, muestraVale, muestraPorAltura, desfaseTimbre, fuenteMuestra, precargarMuestras } from "../../shared/audio/audio.js";

export const PRESION_INICIAL = 0.8;   // 0 = el fuelle casi sin aire, 1 = a fondo; 0,8 suena como siempre
const MIDI_B = { C: 60, "C#": 61, D: 62, "D#": 63, E: 64, F: 65, "F#": 66, G: 67, "G#": 68, A: 69, "A#": 70, B: 71 };

// ── Curvas (puras): de la presión (0 a 1) al volumen, al brillo y a la entrada de la nota ──
export function gananciaDePresion(p) {                       // -26 dB en 0, 0 dB en 0,8 (como antes), +3 dB en 1
  const db = p <= PRESION_INICIAL ? -26 * (PRESION_INICIAL - p) / PRESION_INICIAL : 3 * (p - PRESION_INICIAL) / (1 - PRESION_INICIAL);
  return Math.pow(10, db / 20);
}
export const corteDePresion = (p) => Math.min(20000, 900 * Math.pow(20, p / PRESION_INICIAL));   // brillo: 900 Hz (apagado) en 0; en 0,8 ya no recorta nada
export const ataqueDePresion = (p) => 0.012 + Math.max(0, PRESION_INICIAL - p) * 0.044;          // segundos: 12 ms desde 0,8 hacia arriba, 47 ms casi sin aire

function crearFuelle(ctx, p) {
  const entrada = ctx.createGain(), filtro = ctx.createBiquadFilter(), limitador = ctx.createDynamicsCompressor();
  filtro.type = "lowpass"; filtro.Q.value = 0.5;
  limitador.threshold.value = -8; limitador.knee.value = 6; limitador.ratio.value = 8;   // evita saturar si suenan varias notas fuertes
  limitador.attack.value = 0.003; limitador.release.value = 0.15;
  entrada.gain.value = gananciaDePresion(p); filtro.frequency.value = corteDePresion(p);
  entrada.connect(filtro); filtro.connect(limitador); limitador.connect(ctx.destination);
  return { ctx, entrada, filtro, limitador };
}

export function useSonidoEjecucion({ bellows }) {
  const activasRef = useRef({});                 // { [botón]: {gainMain, oscs[]} }
  const fuelleRef = useRef(bellows); fuelleRef.current = bellows;   // abre / cierra de ahora
  const presionRef = useRef(PRESION_INICIAL);
  const busRef = useRef(null);
  useEffect(() => { precargarMuestras(); }, []);

  // El fuelle común se arma la primera vez que hace falta (el sonido del navegador arranca recién con el primer toque)
  const bus = useCallback(() => {
    const ctx = getCtx(); if (!ctx) return null;
    if (!busRef.current || busRef.current.ctx !== ctx) busRef.current = crearFuelle(ctx, presionRef.current);
    return busRef.current;
  }, []);

  const setPresion = useCallback((p) => {
    const v = Math.min(1, Math.max(0, p));
    presionRef.current = v;
    const b = busRef.current; if (!b) return;
    try {
      const t = b.ctx.currentTime;   // el cambio se alisa en unos 30 ms: sin clics ni escalones
      b.entrada.gain.setTargetAtTime(gananciaDePresion(v), t, 0.03);
      b.filtro.frequency.setTargetAtTime(corteDePresion(v), t, 0.03);
    } catch (e) {}
  }, []);

  const startNote = useCallback((id, eng, oct) => {
    try {
      const b = bus(); if (!b) return;
      const ctx = b.ctx;
      if (ctx.state === "suspended") ctx.resume();
      if (activasRef.current[id]) return;                 // ya suena: evita el doble disparo
      const midi = (MIDI_B[eng] ?? 60) + (oct - 4) * 12;   // Do4 = 60
      const freq = 440 * Math.pow(2, (midi + desfaseTimbre() - 69) / 12);
      const gainMain = ctx.createGain();
      gainMain.gain.setValueAtTime(0, ctx.currentTime);
      gainMain.gain.linearRampToValueAtTime(1, ctx.currentTime + ataqueDePresion(presionRef.current));
      gainMain.connect(b.entrada);
      const propia = buscarMuestra(id.startsWith("L") ? "izq" : "der", fuelleRef.current, id);
      const muestra = muestraVale(propia, midi) ? propia : muestraPorAltura(midi);
      if (muestra) {
        const src = fuenteMuestra(ctx, muestra); src.connect(gainMain);
        activasRef.current[id] = { gainMain, oscs: [src] };
        return;
      }
      const grave = freq < 140;                            // sin muestra: el sintetizador de siempre
      const parciales = grave ? [1, 2, 3, 4, 5, 6] : [1, 2, 3];
      const ganancias = grave ? [0.20, 0.16, 0.12, 0.09, 0.06, 0.04] : [0.22, 0.10, 0.05];
      const oscs = parciales.map((h, i) => {
        const osc = ctx.createOscillator(), g = ctx.createGain();
        osc.type = "sawtooth"; osc.frequency.value = freq * h; g.gain.value = ganancias[i];
        osc.connect(g); g.connect(gainMain); osc.start();
        return osc;
      });
      activasRef.current[id] = { gainMain, oscs };
    } catch (e) {}
  }, [bus]);

  const stopNote = useCallback((id) => {
    const n = activasRef.current[id]; if (!n) return;
    try {
      const ctx = getCtx(); if (!ctx) return;
      const t = ctx.currentTime;
      n.gainMain.gain.cancelScheduledValues(t);
      n.gainMain.gain.setValueAtTime(n.gainMain.gain.value, t);
      n.gainMain.gain.linearRampToValueAtTime(0.0001, t + 0.09);   // salida corta y sin clic
      n.oscs.forEach(o => o.stop(t + 0.11));
    } catch (e) {}
    delete activasRef.current[id];
  }, []);

  const stopAllNotes = useCallback(() => { Object.keys(activasRef.current).forEach(stopNote); }, [stopNote]);

  // Al salir de la pestaña se corta todo y se desarma el fuelle
  useEffect(() => () => {
    stopAllNotes();
    const b = busRef.current; busRef.current = null;
    if (b) setTimeout(() => { try { b.entrada.disconnect(); b.filtro.disconnect(); b.limitador.disconnect(); } catch (e) {} }, 300);
  }, [stopAllNotes]);

  return { startNote, stopNote, stopAllNotes, setPresion };
}
