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
// Las mismas cuatro, en orden alrededor del teclado: sirven para dibujar su contorno al alinear
export const CONTORNO = { der: ["R01", "R04", "R38", "R31"], izq: ["L01", "L04", "L33", "L26"] };

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

// ── Estirado: corrige que el teclado físico tenga otras proporciones (más largo o más corto en un eje) ──
// Estira las POSICIONES de las teclas (las teclas siguen siendo redondas) en el sistema del propio teclado:
// sx a lo ancho y sy a lo alto, alrededor del centro del teclado.
export const CERO = { dx: 0, dy: 0, rot: 0, sx: 1, sy: 1 };
export const clavePos = (forma, mano, suf) => `${forma}-${mano}-${suf}`;   // suf: «fs» con pantalla completa y «nf» sin ella (la pantalla útil cambia de lugar)
export function estirar(g, sx = 1, sy = 1) {
  if (sx === 1 && sy === 1) return g;
  const h = BTN_SIZE / 2;
  const items = g.items.map(it => ({ ...it, x: (it.x + h) * sx - h, y: (it.y + h) * sy - h }));
  let sep = Infinity;   // la separación entre teclas cambia al estirar
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) sep = Math.min(sep, Math.hypot(items[i].x - items[j].x, items[i].y - items[j].y));
  return { ...g, W: g.W * sx, H: g.H * sy, sep, items };
}
// Cuánto mide el teclado entre los centros de sus teclas más separadas, en mm (ancho, alto)
export function extension(g) {
  if (!g.items.length) return { w: 0, h: 0 };
  const xs = g.items.map(i => i.x), ys = g.items.map(i => i.y);
  return { w: (Math.max(...xs) - Math.min(...xs)) / U, h: (Math.max(...ys) - Math.min(...ys)) / U };
}

// ── Dónde queda cada teclado en la pantalla, a tamaño real ──
// G: geometrías; manos: ["izq","der"] o una sola; k: píxeles por unidad; vista: tamaño de la pantalla;
// pos: ajustes guardados {"real-der-nf": {dx, dy, rot, sx, sy}} con dx, dy en mm y rot en grados; pxcm: píxeles por cm.
// Siempre se centra respecto de la PANTALLA (no de la zona libre), así abrir o cerrar un panel no mueve el teclado.
export function colocar(G, manos, forma, k, vista, pos, pxcm, suf = "nf") {
  const gs = G.map((g, i) => { const p = (pos && pos[clavePos(forma, manos[i], suf)]) || CERO; return estirar(g, p.sx || 1, p.sy || 1); });
  const w = gs.map(g => g.W * k), h = gs.map(g => g.H * k);
  const total = w.reduce((s, x) => s + x, 0) + GAP * k * (gs.length - 1);
  let x = vista.w / 2 - total / 2;
  const px = pxcm / 10;
  return gs.map((g, i) => {
    const p = (pos && pos[clavePos(forma, manos[i], suf)]) || CERO;
    const left = x, top = vista.h / 2 - h[i] / 2;
    x += w[i] + GAP * k;
    const bx = left + w[i] / 2, by = top + h[i] / 2;   // centro del teclado sin corrimiento
    return { mano: manos[i], g, left, top, w: w[i], h: h[i], tx: p.dx * px, ty: p.dy * px, rot: p.rot,
             bx, by, cx: bx + p.dx * px, cy: by + p.dy * px };   // cx, cy: centro del teclado en pantalla
  });
}

// ── Ajuste a partir de toques ──
// Cada par es {v: centro de la tecla dibujada, t: dónde tocó el dedo}, en píxeles de pantalla. Con el teclado físico encima,
// el dedo solo llega al vidrio por el agujero, así que el toque cae en el centro del agujero.
// est: cómo está ahora el teclado dibujado {cx, cy (centro en pantalla), rot (grados), sx, sy}.
// Con 1 toque solo mueve; con 2 mueve, gira y cambia el tamaño parejo; con 3 o más busca además el estirado de ancho y de alto por separado.
// Devuelve cómo debe quedar: rot (grados), sx, sy (estirado total), el centro nuevo (cx, cy en px) y kx, ky (cuánto cambia el ancho y el alto).
export function ajusteTeclado(pares, est) {
  const n = pares.length;
  if (!n) return null;
  const r = est.rot * Math.PI / 180, cr = Math.cos(r), sr = Math.sin(r);
  const b = pares.map(p => { const dx = p.v.x - est.cx, dy = p.v.y - est.cy; return { x: cr * dx + sr * dy, y: -sr * dx + cr * dy }; });   // cada tecla en el sistema del teclado, sin girar
  const T = pares.map(p => p.t);
  const med = (a) => ({ x: a.reduce((s, q) => s + q.x, 0) / n, y: a.reduce((s, q) => s + q.y, 0) / n });
  const mb = med(b), mt = med(T);
  let A = [cr, -sr, sr, cr];   // [a b c d]: por defecto la rotación que ya tiene (con un solo toque solo se mueve)
  if (n >= 2) {
    let sxx = 0, sxy = 0, syy = 0, tbx = 0, tby = 0, uby = 0, ubx = 0, nr = 0, ni = 0;
    pares.forEach((_, i) => {
      const zx = b[i].x - mb.x, zy = b[i].y - mb.y, wx = T[i].x - mt.x, wy = T[i].y - mt.y;
      sxx += zx * zx; sxy += zx * zy; syy += zy * zy;
      tbx += wx * zx; tby += wx * zy; ubx += wy * zx; uby += wy * zy;
      nr += zx * wx + zy * wy; ni += zx * wy - zy * wx;
    });
    const det = sxx * syy - sxy * sxy;
    if (n >= 3 && det > 1e-6 * (sxx + syy) * (sxx + syy)) {
      A = [(tbx * syy - tby * sxy) / det, (tby * sxx - tbx * sxy) / det, (ubx * syy - uby * sxy) / det, (uby * sxx - ubx * sxy) / det];   // afín por mínimos cuadrados
    } else if (sxx + syy > 1e-6) {
      A = [nr / (sxx + syy), -ni / (sxx + syy), ni / (sxx + syy), nr / (sxx + syy)];   // semejanza: giro y tamaño parejo
    }
  }
  const th = Math.atan2(A[2] - A[1], A[0] + A[3]), ct = Math.cos(th), st = Math.sin(th);   // giro más cercano
  const kx = ct * A[0] + st * A[2], ky = -st * A[1] + ct * A[3];                            // lo que queda en la diagonal: estirado de ancho y de alto
  const ax = ct * kx, bx_ = -st * ky, ay = st * kx, by_ = ct * ky;                           // A sin corte = R·diag(kx, ky)
  return { rot: th * 180 / Math.PI, sx: est.sx * kx, sy: est.sy * ky, kx, ky, n,
           cx: mt.x - (ax * mb.x + bx_ * mb.y), cy: mt.y - (ay * mb.x + by_ * mb.y) };
}
