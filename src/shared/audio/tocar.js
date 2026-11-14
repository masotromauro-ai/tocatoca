// @motor
// Toca una lista de notas con nombre, una tras otra.

import { CHROMATIC, noteIdx } from "../teoria/notas.js";
import { playBand } from "./audio.js";

// ═══════════════════════════════════════════════════════════════════════════
// ─── MODOS (transportables) y COLORES (lineal · circular · espiral) ──────────
// ═══════════════════════════════════════════════════════════════════════════
export const tocarNombres=(names,oct=4)=>{ let o=oct, prev=-1; names.forEach((n,i)=>{ const pc=noteIdx(n); if(pc<=prev) o++; prev=pc; setTimeout(()=>playBand(CHROMATIC[pc],o),i*420); }); };
