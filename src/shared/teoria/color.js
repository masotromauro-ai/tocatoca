// Color de cada nota: la paleta oficial NC (la del manual) y las mezclas de luz. Lógica pura. Si NC cambia, cambia también public/gestos/musica.js.

import { CHROMATIC, noteIdx } from "./notas.js";

// ─── COLORES TONALES ──────────────────────────────────────────────────────────
// Paleta oficial "de estudio" (Manual de teoría musical a través del color,
// Capítulo 0 / Capítulo 5 / Anexo — Ficha de referencia rápida).
// Fuente única de verdad para el color de cada nota en TODA la app.
export const NC = {
  C:"#002e93", D:"#357a25", E:"#845523", F:"#b8823c",
  G:"#f1b302", A:"#cd2821", B:"#672e87",
  "C#":"#23879f","Db":"#23879f",
  "D#":"#91a51e","Eb":"#91a51e",
  "F#":"#ecd9a3","Gb":"#ecd9a3",
  "G#":"#dc7212","Ab":"#dc7212",
  "A#":"#da4571","Bb":"#da4571",
};

export const nc = (n) => { const k=n?.replace(/[0-9]/g,"").trim(); if(NC[k]) return NC[k]; const i=noteIdx(k); return (i>=0 && NC[CHROMATIC[i]]) || "#888"; };

// ─── MEZCLA DE COLOR DE ACORDES (Capítulo 10 del manual) ──────────────────────
// Modelo "luz" (promedio aditivo en RGB) con criterio "raíz dominante":
// la fundamental se queda con rootWeight% del peso total (80% por defecto) y el
// resto del acorde reparte en partes iguales el porcentaje restante. Así el color
// resultante nunca se aleja demasiado de la tónica, sin importar las tensiones.
export const hexToRgb = (hex) => {
  const h = hex.replace("#","");
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
};

export const rgbToHex = (r,g,b) => "#"+[r,g,b].map(v=>Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,"0")).join("");

export const mixLuzRaizDominante = (notes, rootWeight=0.8) => {
  // notes: array de nombres de nota (la primera es la raíz)
  if(!notes || notes.length===0) return "#888888";
  if(notes.length===1) return nc(notes[0]);
  const restW = (1-rootWeight)/(notes.length-1);
  let r=0,g=0,b=0;
  notes.forEach((n,i)=>{
    const w = i===0 ? rootWeight : restW;
    const [rr,gg,bb] = hexToRgb(nc(n));
    r+=rr*w; g+=gg*w; b+=bb*w;
  });
  return rgbToHex(r,g,b);
};
