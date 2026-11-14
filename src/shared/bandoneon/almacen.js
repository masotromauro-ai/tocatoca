// El teclado de cada uno, guardado en el teléfono.

import { DEFS_L, DEFS_R } from "./layouts.js";

// ─── STORAGE DE CONFIGURACIÓN ────────────────────────────────────────────────
export const STORAGE_KEY_L = "bandoneon_left_v1";

const STORAGE_KEY_R = "bandoneon_right_v1";

export function loadBtns() {
  try {
    const rawL = localStorage.getItem(STORAGE_KEY_L);
    const rawR = localStorage.getItem(STORAGE_KEY_R);
    // Retrocompatibilidad: si los datos guardados no tienen oct_abre, los tomamos de DEFS
    const mergeOct = (loaded, defaults) => loaded.map(b => {
      if (b.oct_abre !== undefined) return b;
      const def = defaults.find(d => d.id === b.id);
      return { ...b, oct_abre: def?.oct_abre ?? 3, oct_cierra: def?.oct_cierra ?? 3 };
    });
    return {
      left:  rawL ? mergeOct(JSON.parse(rawL), DEFS_L) : DEFS_L.map(b=>({...b})),
      right: rawR ? mergeOct(JSON.parse(rawR), DEFS_R) : DEFS_R.map(b=>({...b})),
    };
  } catch { return { left: DEFS_L.map(b=>({...b})), right: DEFS_R.map(b=>({...b})) }; }
}

export function saveBtns(left, right) {
  try {
    localStorage.setItem(STORAGE_KEY_L, JSON.stringify(left));
    localStorage.setItem(STORAGE_KEY_R, JSON.stringify(right));
  } catch(e) {}
}

export function clearBtns() {
  localStorage.removeItem(STORAGE_KEY_L);
  localStorage.removeItem(STORAGE_KEY_R);
}
