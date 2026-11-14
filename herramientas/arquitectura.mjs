// herramientas/arquitectura.mjs — las seis reglas de ARQUITECTURA.md, vigiladas por código (fase 0).
// Lee una carpeta src/ y devuelve { errores, avisos }. Hoy src/ no tiene shared/ ni features/, así que
// sólo se exigen los intocables; cada carpeta nueva que aparezca empieza a exigirse sola.
//   node pruebas/arquitectura.mjs      (revisa src/ de verdad y corre los casos de prueba)
import fs from "node:fs";
import path from "node:path";

export const LIMITE_AVISO = 300, LIMITE_DURO = 400;
const CODIGO = /\.(jsx?|mjs)$/;
const PROHIBIDO_EN_PURO = [[/from\s+["']react(-dom)?(\/[^"']*)?["']/, "importa React"], [/\bwindow\b/, "usa window"], [/\bdocument\b/, "usa document"], [/\blocalStorage\b/, "usa localStorage"], [/\bsessionStorage\b/, "usa sessionStorage"]];

function archivos(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...archivos(p)); else out.push(p);
  }
  return out;
}
const cabeza = (txt) => txt.split("\n").slice(0, 8).join("\n");
const sinComentarios = (txt) => txt.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");

/** A qué capa pertenece un archivo (ruta relativa a src, con /). */
export function capaDe(rel) {
  const m = rel.match(/^(shared|features)\/(?:([^/]+)\/)?/);
  if (!m) return { capa: "app", feature: null };
  if (m[1] === "shared") return { capa: "shared", feature: null };
  return { capa: "features", feature: m[2] || "" };
}
export const esPuro = (rel, txt) => /^shared\/teoria\//.test(rel) || /(^|\/)voicings\.js$/.test(rel)
  || (/^shared\/audio\//.test(rel) && !/@motor/.test(cabeza(txt))) || /@puro/.test(cabeza(txt));

export function revisar(src) {
  const errores = [], avisos = [];
  const todos = archivos(src).filter((f) => CODIGO.test(f));
  const rel = (f) => path.relative(src, f).split(path.sep).join("/");
  const texto = new Map(todos.map((f) => [rel(f), fs.readFileSync(f, "utf8")]));

  for (const [r, txt] of texto) {
    const { capa, feature } = capaDe(r);
    if (capa === "app") continue;                               // App.jsx, main.jsx, Puerta.jsx: todavía fuera de las reglas
    const lineas = txt.split("\n").length;
    // 1 · tamaño
    if (!/@datos/.test(cabeza(txt))) {
      if (lineas > LIMITE_DURO) errores.push(`${r}: ${lineas} líneas, pasa el máximo de ${LIMITE_DURO} (regla 1). Partirlo, o declarar «// @datos» si es sólo datos.`);
      else if (lineas > LIMITE_AVISO) avisos.push(`${r}: ${lineas} líneas, pasa las ${LIMITE_AVISO} recomendadas (regla 1).`);
    }
    // 2 · dependencias en un solo sentido
    const sc = sinComentarios(txt);
    const imports = [...sc.matchAll(/(?:from|import)\s*\(?\s*["'](\.{1,2}\/[^"']*)["']/g)].map((m) => m[1]);
    for (const imp of imports) {
      const destino = path.posix.normalize(path.posix.join(path.posix.dirname(r), imp));
      const d = capaDe(destino);
      if (destino.startsWith("..")) { errores.push(`${r}: importa «${imp}», que sale de src/.`); continue; }
      if (capa === "shared" && d.capa !== "shared") errores.push(`${r}: shared importa «${imp}» (${d.capa}). shared no conoce a nadie de arriba (regla 2).`);
      if (capa === "features" && d.capa === "features" && d.feature !== feature) errores.push(`${r}: el feature «${feature}» importa del feature «${d.feature}» («${imp}»). Un feature no importa de otro (regla 2).`);
      if (capa === "features" && d.capa === "app") errores.push(`${r}: un feature importa «${imp}», que es de la app. Sólo App.jsx conoce a los features (regla 2).`);
    }
    // 3 · lógica pura
    if (esPuro(r, txt)) for (const [re, que] of PROHIBIDO_EN_PURO) if (re.test(sc)) errores.push(`${r}: es lógica pura y ${que} (regla 3).`);
    // 4 · claves de guardado con un solo dueño
    if (r !== "shared/claves.js" && /["'`]bandomaps_/.test(sc)) errores.push(`${r}: escribe una clave «bandomaps_…» a mano. Las claves se declaran en shared/claves.js y se importan (regla 4).`);
  }

  // Una ficha LEEME.md por carpeta de shared/ y features/ que tenga código (regla 5)
  const carpetas = new Set();
  for (const r of texto.keys()) {
    const p = r.split("/"); if (!/^(shared|features)$/.test(p[0])) continue;
    for (let i = 1; i < p.length; i++) carpetas.add(p.slice(0, i).join("/"));
  }
  for (const c of carpetas) if (!fs.existsSync(path.join(src, c, "LEEME.md"))) errores.push(`${c}/: falta la ficha LEEME.md (regla 5): qué es, qué reglas tiene y qué es intocable.`);

  // Intocables (regla 5): lo que mide el avance de los alumnos tiene que seguir existiendo en alguna parte de src/
  const junto = [...texto.values()].join("\n");
  if (!/function\s+medir\s*\(/.test(junto)) errores.push("intocable: ya no existe la función medir() (src/): sin ella deja de medirse lo que practica cada alumno.");
  if (!/function\s+medirLote\s*\(/.test(junto)) errores.push("intocable: ya no existe la función medirLote().");
  if (!/window\.__tab\s*=/.test(junto)) errores.push("intocable: ya no se pone window.__tab (qué herramienta se usa).");
  if (/harmonia_/.test(junto)) errores.push("hay claves «harmonia_…» en src/: el nombre es bandomaps_, y no existe ninguna harmonia_.");
  return { errores, avisos };
}
