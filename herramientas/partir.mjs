// herramientas/partir.mjs — corta declaraciones de src/App.jsx y las MUEVE a archivos nuevos (fase 1 en adelante).
// «Mover, no reescribir»: a cada declaración sólo se le agrega la palabra `export` si otro archivo la usa, y se
// escriben los `import` que hacen falta. Nada más. Después se comprueba con herramientas/mover.mjs.
//
//   node herramientas/partir.mjs <plan.json> [--aplicar]
//
// El plan: { "archivo": "src/App.jsx",
//            "destinos": { "src/shared/teoria/notas.js": { "cabecera": "…comentario…", "declaraciones": ["CHROMATIC", …] }, … } }
// Sin --aplicar sólo informa: qué pasa a cada archivo, qué imports llevan, y los problemas (una dependencia que se
// queda en App.jsx, un ciclo entre archivos nuevos). Con --aplicar escribe los archivos y recorta App.jsx.
import fs from "node:fs";
import path from "node:path";
import { declaraciones } from "./areas.mjs";

const DECL = /^(?:export default function|export function|function|const|let)\s+([A-Za-z_$][\w$]*)/;
const quitarTextos = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1")
  .replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, '""');
const usaNombre = (texto, nombre) => new RegExp("(?<![\\w$.])" + nombre.replace(/\$/g, "\\$") + "(?![\\w$])").test(texto);

export function planear(src, plan) {
  const L = src.split("\n"), decls = declaraciones(src), porNombre = new Map(decls.map((d) => [d.nombre, d]));
  const problemas = [], destDe = new Map();
  for (const [ruta, d] of Object.entries(plan.destinos)) for (const n of d.declaraciones) {
    if (!porNombre.has(n)) problemas.push(`${ruta}: «${n}» no existe en ${plan.archivo}`);
    else if (destDe.has(n)) problemas.push(`«${n}» está en dos destinos`);
    else destDe.set(n, ruta);
  }
  const textoDe = (n) => L.slice(porNombre.get(n).desde - 1, porNombre.get(n).hasta).join("\n");
  const movidas = new Set(destDe.keys());
  // lo que queda en App.jsx
  const quedan = decls.filter((d) => !movidas.has(d.nombre));
  const restoTexto = quitarTextos(quedan.map((d) => textoDe(d.nombre)).join("\n"));
  // por destino: qué usa de afuera
  const info = {};
  for (const [ruta, d] of Object.entries(plan.destinos)) {
    const propios = new Set(d.declaraciones), imports = new Map(), faltan = new Set();
    const t = quitarTextos(d.declaraciones.filter((n) => porNombre.has(n)).map(textoDe).join("\n"));
    for (const o of decls) {
      if (propios.has(o.nombre) || !usaNombre(t, o.nombre)) continue;
      if (movidas.has(o.nombre)) { const r = destDe.get(o.nombre); (imports.get(r) || imports.set(r, new Set()).get(r)).add(o.nombre); }
      else faltan.add(o.nombre);
    }
    if (faltan.size) problemas.push(`${ruta} usa ${[...faltan].join(", ")}, que se queda en ${plan.archivo}: moverlo también o pasarlo como parámetro`);
    info[ruta] = { imports, exporta: new Set() };
  }
  // qué hay que exportar
  const usadasAfuera = new Set();
  for (const d of Object.values(info)) for (const s of d.imports.values()) s.forEach((n) => usadasAfuera.add(n));
  const importsApp = new Map();
  for (const n of movidas) if (usaNombre(restoTexto, n)) { usadasAfuera.add(n); const r = destDe.get(n); (importsApp.get(r) || importsApp.set(r, new Set()).get(r)).add(n); }
  // ciclos entre destinos
  const color = {}; const visita = (r, pila) => {
    if (color[r] === 2) return; if (color[r] === 1) { problemas.push("ciclo entre archivos: " + [...pila, r].join(" → ")); return; }
    color[r] = 1; for (const o of info[r].imports.keys()) visita(o, [...pila, r]); color[r] = 2;
  };
  Object.keys(info).forEach((r) => visita(r, []));
  return { L, decls, porNombre, destDe, info, importsApp, usadasAfuera, problemas, textoDe, movidas };
}

const relativa = (desde, hacia) => { let r = path.posix.relative(path.posix.dirname(desde), hacia); if (!r.startsWith(".")) r = "./" + r; return r; };

export function generar(src, plan, p) {
  const salida = {};
  for (const [ruta, d] of Object.entries(plan.destinos)) {
    const lineas = [];
    if (d.cabecera) lineas.push(...d.cabecera.split("\n").map((l) => "// " + l), "");
    const imps = [...p.info[ruta].imports].map(([o, ns]) => `import { ${[...ns].sort().join(", ")} } from "${relativa(ruta, o)}";`);
    if (imps.length) lineas.push(...imps, "");
    const ordenadas = d.declaraciones.slice().sort((a, b) => p.porNombre.get(a).desde - p.porNombre.get(b).desde);
    for (const n of ordenadas) {
      let t = p.L.slice(p.porNombre.get(n).desde - 1, p.porNombre.get(n).hasta);
      if (p.usadasAfuera.has(n)) {
        const i = t.findIndex((l) => DECL.test(l));
        t[i] = t[i].replace(/^(const|let|function)\b/, "export $1");
      }
      while (t.length && !t[t.length - 1].trim()) t.pop();
      lineas.push(...t, "");
    }
    salida[ruta] = lineas.join("\n").replace(/\n+$/, "\n");
  }
  // App.jsx recortado
  const quitar = new Set(); for (const n of p.movidas) { const d = p.porNombre.get(n); for (let i = d.desde; i <= d.hasta; i++) quitar.add(i); }
  const resto = p.L.filter((_, i) => !quitar.has(i + 1));
  const imps = [...p.importsApp].map(([o, ns]) => `import { ${[...ns].sort().join(", ")} } from "${relativa(plan.archivo, o)}";`);
  let ult = -1; resto.forEach((l, i) => { if (/^import\b/.test(l)) ult = i; });
  resto.splice(ult + 1, 0, ...imps);
  salida[plan.archivo] = resto.join("\n").replace(/\n{3,}/g, "\n\n");
  return salida;
}

if (process.argv[1] && process.argv[1].endsWith("partir.mjs")) {
  const [archivoPlan, ...resto] = process.argv.slice(2), aplicar = resto.includes("--aplicar");
  if (!archivoPlan) { console.error("Uso: partir.mjs <plan.json> [--aplicar]"); process.exit(2); }
  const plan = JSON.parse(fs.readFileSync(archivoPlan, "utf8")), src = fs.readFileSync(plan.archivo, "utf8");
  const p = planear(src, plan);
  for (const [r, d] of Object.entries(p.info)) {
    console.log(`• ${r}  (${plan.destinos[r].declaraciones.length} declaraciones)`);
    for (const [o, ns] of d.imports) console.log(`    importa de ${o}: ${[...ns].join(", ")}`);
  }
  console.log(`• ${plan.archivo} importa: ${[...p.importsApp].map(([o, ns]) => o + " (" + ns.size + ")").join(", ")}`);
  if (p.problemas.length) { console.log("\n✖ PROBLEMAS:"); p.problemas.forEach((x) => console.log("   " + x)); process.exit(1); }
  if (!aplicar) { console.log("\nSin problemas. Corré con --aplicar para escribir."); process.exit(0); }
  const salida = generar(src, plan, p);
  for (const [r, t] of Object.entries(salida)) { fs.mkdirSync(path.dirname(r), { recursive: true }); fs.writeFileSync(r, t); console.log("  escrito", r, t.split("\n").length + " líneas"); }
}
