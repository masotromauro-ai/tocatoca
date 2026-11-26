// Geometría de la pestaña Ejecución: dónde cae cada botón, cómo se acomoda el teclado en la pantalla
// y la cuenta que saca el ajuste a partir de los toques sobre el teclado físico. Son funciones puras:
// no usan la pantalla, así que se pueden probar solas.

import { BTN_SIZE } from "../../shared/bandoneon/layouts.js";
import { REAL, AGUJERO_MM, AJUSTE } from "./disposicionReal.js";

export const PAD = 14;                   // margen del teclado alrededor de los botones
export const GAP = 48;                   // separación entre teclados cuando se muestran los dos
export const U = BTN_SIZE / AGUJERO_MM;  // unidades del dibujo por milímetro real: el botón mide justo lo que el agujero

// Sentido del giro en la forma «Real» (un cuarto de vuelta, según el profesor):
// derecha: el borde derecho del dibujo (Sol agudo) queda abajo, girando hacia la derecha ("cw");
// izquierda: el borde izquierdo (Re 1) queda abajo, girando hacia la izquierda ("ccw").
export const GIRO = { izq: "ccw", der: "cw" };

// Las cuatro teclas de las esquinas de cada teclado (las que tienen cruz en los dibujos)
export const ESQUINAS = { der: ["R01", "R04", "R31", "R38"], izq: ["L01", "L04", "L26", "L33"] };

// ── Dónde cae cada botón y cuánto mide el teclado ──
export function geometria(btns, forma, mano) {
  if (!btns.length) return { W: 2 * PAD, H: 2 * PAD, items: [], sep: Infinity };
  const iw = Math.max(...btns.map(b => b.x)) + BTN_SIZE;   // ancho del dibujo original
  const ih = Math.max(...btns.map(b => b.y)) + BTN_SIZE;   // alto del dibujo original
  let sep = Infinity;   // separación mínima entre centros: limita cuánto se pueden agrandar los botones
  for (let i = 0; i < btns.length; i++) for (let j = i + 1; j < btns.length; j++) sep = Math.min(sep, Math.hypot(btns[i].x - btns[j].x, btns[i].y - btns[j].y));
  if (forma !== "real") {
    return { W: iw + 2 * PAD, H: ih + 2 * PAD, sep, items: btns.map(b => ({ b, x: b.x + PAD, y: b.y + PAD })) };
  }
  const ccw = GIRO[mano] !== "cw";
  return {
    W: ih + 2 * PAD, H: iw + 2 * PAD, sep,
    items: btns.map(b => ccw
      ? { b, x: b.y + PAD,                   y: iw - (b.x + BTN_SIZE) + PAD }
      : { b, x: ih - (b.y + BTN_SIZE) + PAD, y: b.x + PAD }),
  };
}

// Pone cada botón en la posición real de su agujero (en mm → unidades del dibujo). Si a algún botón le faltara dato, queda el dibujo de la app.
export function conMedidas(btns, mano) {
  const t = REAL[mano];
  if (!t || btns.some(b => !t[b.id])) return btns;
  return btns.map(b => ({ ...b, x: t[b.id][0] * AJUSTE[mano] * U, y: t[b.id][1] * AJUSTE[mano] * U }));
}

// ── Dónde queda cada teclado en la pantalla, a tamaño real ──
// G: geometrías; manos: ["izq","der"] o una sola; k: píxeles por unidad; vista: tamaño de la pantalla;
// pos: ajustes guardados {"real-der": {dx, dy, rot}} con dx, dy en mm y rot en grados; pxcm: píxeles por cm.
// Siempre se centra respecto de la PANTALLA (no de la zona libre), así abrir o cerrar un panel no mueve el teclado.
export function colocar(G, manos, forma, k, vista, pos, pxcm) {
  const w = G.map(g => g.W * k), h = G.map(g => g.H * k);
  const total = w.reduce((s, x) => s + x, 0) + GAP * k * (G.length - 1);
  let x = vista.w / 2 - total / 2;
  const px = pxcm / 10;
  return G.map((g, i) => {
    const p = (pos && pos[forma + "-" + manos[i]]) || { dx: 0, dy: 0, rot: 0 };
    const left = x, top = vista.h / 2 - h[i] / 2;
    x += w[i] + GAP * k;
    return { mano: manos[i], left, top, w: w[i], h: h[i], tx: p.dx * px, ty: p.dy * px, rot: p.rot,
             cx: left + w[i] / 2 + p.dx * px, cy: top + h[i] / 2 + p.dy * px };   // cx, cy: centro del teclado en pantalla
  });
}

// ── Ajuste a partir de toques ──
// Cada par es {v: centro de la tecla dibujada, t: dónde tocó el dedo}, en píxeles de pantalla. Con el teclado físico encima,
// el dedo solo llega al vidrio por el agujero, así que el toque cae en el centro del agujero. Se busca el movimiento y el giro
// (y el tamaño, solo para informar o corregir) que mejor llevan las teclas dibujadas a los toques.
// centro: centro actual del teclado en pantalla (el giro es alrededor de ese punto).
// Devuelve cuánto hay que correr el teclado (ddx, ddy en px), cuánto girarlo (giro en grados) y la escala medida.
export function ajusteDesdeToques(pares, centro, conEscala = false) {
  const n = pares.length;
  if (!n) return null;
  const mv = { x: 0, y: 0 }, mt = { x: 0, y: 0 };
  pares.forEach(p => { mv.x += p.v.x / n; mv.y += p.v.y / n; mt.x += p.t.x / n; mt.y += p.t.y / n; });
  let ar = 1, ai = 0;                         // a = escala·(cos θ + i sen θ), por mínimos cuadrados con números complejos
  let den = 0, nr = 0, ni = 0;
  pares.forEach(p => {
    const zx = p.v.x - mv.x, zy = p.v.y - mv.y, wx = p.t.x - mt.x, wy = p.t.y - mt.y;
    nr += zx * wx + zy * wy; ni += zx * wy - zy * wx; den += zx * zx + zy * zy;
  });
  if (n >= 2 && den > 1e-6) { ar = nr / den; ai = ni / den; }
  const s = Math.hypot(ar, ai) || 1, th = Math.atan2(ai, ar);
  const q = conEscala ? s : 1, c = Math.cos(th) * q, sn = Math.sin(th) * q;
  const vx = mv.x - centro.x, vy = mv.y - centro.y;   // centroide dibujado, respecto del centro del teclado
  const nx = mt.x - (c * vx - sn * vy), ny = mt.y - (sn * vx + c * vy);   // dónde debe quedar el centro del teclado
  return { ddx: nx - centro.x, ddy: ny - centro.y, giro: th * 180 / Math.PI, escala: s, n };
}
