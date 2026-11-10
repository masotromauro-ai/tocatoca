/* herramientas/areas.mjs — parte App.jsx en ÁREAS sin tocarlo (areas-1, 10-nov-2026).
   Lee el código como texto: busca las declaraciones de primer nivel (function, const,
   let) y las junta en las áreas que dice areas.json. Sirve para tres cosas:
   · que el mapa no mienta (pruebas/areas.mjs falla si una declaración queda sin área);
   · armar el «paquete» de un área para darle a un chat con poco cupo;
   · medir cuánto pesa cada área antes de partirla de verdad.
   Sin dependencias: corre con node a secas, y es lo mismo que usa el panel en el navegador. */

const DECL = /^(?:export default function|export function|function|const|let)\s+([A-Za-z_$][\w$]*)/;

/** Las declaraciones de primer nivel: { nombre, desde, hasta } (líneas, desde 1).
 *  Los comentarios pegados arriba de una declaración (sin renglón en blanco) viajan con ella. */
export function declaraciones(src) {
  const L = String(src).split("\n"), out = [];
  L.forEach((l, i) => { const m = DECL.exec(l); if (m) out.push({ nombre: m[1], desde: i + 1 }); });
  out.forEach((d) => {
    let a = d.desde;
    while (a > 1 && /^\s*(\/\/|\/\*|\*)/.test(L[a - 2]) && !DECL.test(L[a - 2])) a--;
    d.desde = a;
  });
  out.forEach((d, i) => { d.hasta = i + 1 < out.length ? out[i + 1].desde - 1 : L.length; });
  return out;
}

/** Controla que las áreas cubran TODAS las declaraciones, en orden y sin repetir. Devuelve la lista de problemas. */
export function verificar(areas, decls) {
  const err = [], idx = new Map(decls.map((d, i) => [d.nombre, i]));
  const ids = new Set();
  let siguiente = 0;
  for (const a of areas) {
    if (ids.has(a.id)) err.push(`área repetida: ${a.id}`); ids.add(a.id);
    for (const [d, h] of a.tramos || []) {
      if (!idx.has(d)) { err.push(`${a.id}: no existe «${d}» en el archivo`); continue; }
      if (!idx.has(h)) { err.push(`${a.id}: no existe «${h}» en el archivo`); continue; }
      const i = idx.get(d), j = idx.get(h);
      if (j < i) err.push(`${a.id}: «${h}» está antes que «${d}»`);
      else if (i !== siguiente) err.push(`${a.id}: empieza en «${d}» y debería empezar en «${decls[siguiente] && decls[siguiente].nombre}»`);
      siguiente = Math.max(siguiente, j + 1);
    }
  }
  if (siguiente < decls.length) err.push(`quedan sin área desde «${decls[siguiente].nombre}»`);
  return err;
}

/** El código de un área (todos sus tramos) y cuánto pesa. */
export function extraer(src, area, decls = declaraciones(src)) {
  const L = String(src).split("\n"), idx = new Map(decls.map((d) => [d.nombre, d]));
  const partes = (area.tramos || []).map(([d, h]) => {
    const a = idx.get(d), b = idx.get(h);
    return { de: a.desde, a: b.hasta, texto: L.slice(a.desde - 1, b.hasta).join("\n") };
  });
  const texto = partes.map((p) => `// ── ${area.id}: líneas ${p.de}–${p.a} de src/App.jsx ──\n${p.texto}`).join("\n\n");
  const lineas = partes.reduce((t, p) => t + (p.a - p.de + 1), 0);
  return { texto, lineas, tokens: Math.round(texto.length / 3.3), partes };
}

/** Qué declaraciones de OTRAS áreas usa un área (por nombre, mirando el código). Sirve para que el
 *  paquete traiga también lo que hace falta para entenderla. Puede incluir de más, nunca de menos
 *  en el primer nivel (no sigue las dependencias de las dependencias). */
export function usa(src, area, areas, decls = declaraciones(src)) {
  const propios = new Set();
  for (const [d, h] of area.tramos || []) {
    const i = decls.findIndex((x) => x.nombre === d), j = decls.findIndex((x) => x.nombre === h);
    for (let k = i; k <= j && i >= 0 && j >= 0; k++) propios.add(decls[k].nombre);
  }
  const dueno = new Map();
  for (const a of areas) for (const [d, h] of a.tramos || []) {
    const i = decls.findIndex((x) => x.nombre === d), j = decls.findIndex((x) => x.nombre === h);
    for (let k = i; k <= j && i >= 0 && j >= 0; k++) dueno.set(decls[k].nombre, a.id);
  }
  const L = String(src).split("\n"), texto = extraer(src, area, decls).texto;
  const sinCom = texto.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  const out = [];
  for (const d of decls) {
    if (propios.has(d.nombre) || !new RegExp("(?<![\\w$.])" + d.nombre.replace(/\$/g, "\\$") + "(?![\\w$])").test(sinCom)) continue;
    out.push({ nombre: d.nombre, area: dueno.get(d.nombre), lineas: d.hasta - d.desde + 1, texto: L.slice(d.desde - 1, d.hasta).join("\n") });
  }
  return out;
}
