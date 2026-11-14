// herramientas/mover.mjs — comprueba que un tramo se MOVIÓ y no se reescribió (fase 0 de ARQUITECTURA.md).
// Compara el conjunto de renglones de código de un archivo "antes" contra la suma de los archivos "después",
// ignorando los import y la palabra export. Si un renglón cambió o desapareció, o apareció uno que antes no estaba, falla.
//
//   node herramientas/mover.mjs --base <rama|commit> src/App.jsx  nuevo1.js nuevo2.jsx …   (src/App.jsx tal como está en <base>)
//   node herramientas/mover.mjs antes.jsx despues1.jsx despues2.js                          (dos archivos de disco)
//
// Se compara como multiconjunto de renglones recortados: un renglón repetido tres veces tiene que seguir
// repetido tres veces. Los renglones vacíos no cuentan. Un archivo "después" puede ser el mismo App.jsx recortado.
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/** Saca los import (también los de varios renglones) y el export, y devuelve los renglones con código. */
export function renglones(texto) {
  const sinImports = String(texto)
    .replace(/^\s*import\s+(?:[\w*{}\s,$]+?\s+from\s+)?["'][^"']+["'];?[ \t]*$/gm, "")
    .replace(/^\s*import\s*\{[^}]*\}\s*from\s*["'][^"']+["'];?[ \t]*$/gm, "");
  return sinImports.split(/\r?\n/)
    .map((l) => l.trim().replace(/^export\s+default\s+(?=function|class|const|let)/, "").replace(/^export\s+(?=function|class|const|let|async)/, ""))
    .filter((l) => l && !/^export\s*\{[^}]*\};?$/.test(l));
}

const contar = (ls) => { const m = new Map(); for (const l of ls) m.set(l, (m.get(l) || 0) + 1); return m; };

/** Devuelve { sobran, faltan }: renglones que aparecen de más / de menos en "después" respecto de "antes". */
export function comparar(antes, despues) {
  const a = contar(renglones(antes)), d = contar(despues.flatMap((t) => renglones(t)));
  const faltan = [], sobran = [];
  for (const [l, n] of a) { const k = d.get(l) || 0; if (k < n) faltan.push({ renglon: l, veces: n - k }); }
  for (const [l, n] of d) { const k = a.get(l) || 0; if (n > k) sobran.push({ renglon: l, veces: n - k }); }
  return { faltan, sobran, ok: !faltan.length && !sobran.length };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let base = null;
  if (args[0] === "--base") { base = args[1]; args.splice(0, 2); }
  const [archivoAntes, ...despues] = args;
  if (!archivoAntes || !despues.length) { console.error("Uso: mover.mjs [--base <ref>] <antes> <despues…>"); process.exit(2); }
  const antes = base ? execFileSync("git", ["show", `${base}:${archivoAntes}`], { encoding: "utf8", maxBuffer: 64 << 20 }) : fs.readFileSync(archivoAntes, "utf8");
  const r = comparar(antes, despues.map((f) => fs.readFileSync(f, "utf8")));
  const muestra = (xs) => xs.slice(0, 15).forEach((x) => console.log(`     ${x.veces}× ${x.renglon.slice(0, 140)}`));
  if (r.ok) { console.log(`✔ sólo se movió: ${renglones(antes).length} renglones de código, ninguno cambió.`); process.exit(0); }
  if (r.faltan.length) { console.log(`✖ ${r.faltan.length} renglón(es) que estaban y ya no están:`); muestra(r.faltan); }
  if (r.sobran.length) { console.log(`✖ ${r.sobran.length} renglón(es) nuevos o cambiados:`); muestra(r.sobran); }
  process.exit(1);
}
