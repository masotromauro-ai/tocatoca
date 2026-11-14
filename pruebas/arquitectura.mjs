// pruebas/arquitectura.mjs — vigila las seis reglas de ARQUITECTURA.md sobre src/ y se prueba a sí misma.
// Sin npm ni red:  node pruebas/arquitectura.mjs
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { revisar, capaDe, esPuro } from "../herramientas/arquitectura.mjs";
let ok = 0, mal = 0;
const t = (n, f) => { try { f(); ok++; console.log("  ✓ " + n); } catch (e) { mal++; console.log("  ✗ " + n + "\n      " + e.message); } };

const INTOCABLES = "function medir(a,b,c){}\nfunction medirLote(){}\nwindow.__tab=1;\n";
function arbol(archivos) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "arq-"));
  const todos = { "App.jsx": INTOCABLES, ...archivos };
  for (const [r, txt] of Object.entries(todos)) { const p = path.join(d, r); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, txt); }
  return d;
}
const errs = (a) => revisar(arbol(a)).errores;
const FICHA = "# ficha";

t("la capa de un archivo", () => {
  assert.deepEqual(capaDe("shared/teoria/notas.js"), { capa: "shared", feature: null });
  assert.deepEqual(capaDe("features/entrenador/panel.jsx"), { capa: "features", feature: "entrenador" });
  assert.equal(capaDe("App.jsx").capa, "app");
});
t("un src sin carpetas nuevas sólo exige los intocables", () => assert.deepEqual(errs({}), []));
t("sin medir(), medirLote() o window.__tab falla (aunque no haya carpetas)", () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "arq-")); fs.writeFileSync(path.join(d, "App.jsx"), "const x=1;");
  assert.equal(revisar(d).errores.length, 3);
});
t("«harmonia_» en cualquier parte de src falla", () => assert.ok(errs({ "App.jsx": INTOCABLES + 'localStorage.getItem("harmonia_x")' }).some((e) => /harmonia_/.test(e))));
t("regla 1: pasar las 400 líneas falla, pasar las 300 avisa, «@datos» exime", () => {
  const largo = (n, cab = "") => cab + "const a = 1;\n".repeat(n);
  assert.ok(errs({ "shared/LEEME.md": FICHA, "shared/grande.js": largo(450) }).some((e) => /regla 1/.test(e)));
  assert.equal(errs({ "shared/LEEME.md": FICHA, "shared/datos.js": largo(450, "// @datos\n") }).length, 0);
  const r = revisar(arbol({ "shared/LEEME.md": FICHA, "shared/medio.js": largo(320) })); assert.equal(r.errores.length, 0); assert.equal(r.avisos.length, 1);
});
t("regla 2: shared no importa de features ni de App; un feature no importa de otro", () => {
  assert.ok(errs({ "shared/LEEME.md": FICHA, "features/LEEME.md": FICHA, "features/a/LEEME.md": FICHA, "features/a/x.js": "export const x=1;", "shared/y.js": 'import {x} from "../features/a/x.js";' }).some((e) => /shared importa/.test(e)));
  assert.ok(errs({ "features/LEEME.md": FICHA, "features/a/LEEME.md": FICHA, "features/b/LEEME.md": FICHA, "features/a/x.js": "export const x=1;", "features/b/y.js": 'import {x} from "../a/x.js";' }).some((e) => /otro/.test(e)));
  assert.ok(errs({ "features/LEEME.md": FICHA, "features/a/LEEME.md": FICHA, "features/a/x.js": 'import App from "../../App.jsx";' }).some((e) => /app/.test(e)));
});
t("regla 2: lo permitido pasa (feature → shared, mismo feature, import() diferido)", () =>
  assert.deepEqual(errs({ "shared/LEEME.md": FICHA, "shared/z.js": "export const z=1;", "features/LEEME.md": FICHA, "features/a/LEEME.md": FICHA, "features/a/x.js": 'import {z} from "../../shared/z.js";\nimport("./y.js");', "features/a/y.js": "export const y=1;" }), []));
t("regla 3: la lógica pura no usa React, window, document ni localStorage; un comentario no cuenta", () => {
  assert.ok(errs({ "shared/LEEME.md": FICHA, "shared/teoria/LEEME.md": FICHA, "shared/teoria/n.js": "const a = window.innerWidth;" }).some((e) => /regla 3/.test(e)));
  assert.equal(errs({ "shared/LEEME.md": FICHA, "shared/teoria/LEEME.md": FICHA, "shared/teoria/n.js": "// no usa window\nconst a = 1;" }).length, 0);
  assert.equal(esPuro("shared/audio/motor.js", "// @motor\nnew AudioContext()"), false);
  assert.equal(esPuro("shared/bandoneon/voicings.js", ""), true);
});
t("regla 4: una clave bandomaps_ a mano fuera de shared/claves.js falla", () => {
  assert.ok(errs({ "shared/LEEME.md": FICHA, "shared/x.js": 'localStorage.getItem("bandomaps_a")' }).some((e) => /regla 4/.test(e)));
  assert.equal(errs({ "shared/LEEME.md": FICHA, "shared/claves.js": 'export const K = "bandomaps_a";' }).length, 0);
});
t("regla 5: cada carpeta con código necesita su LEEME.md", () => assert.ok(errs({ "shared/x.js": "export const a=1;" }).some((e) => /LEEME/.test(e))));

// Lo de verdad: src/ de este repositorio
const src = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src");
t("src/ cumple hoy lo que ya se exige", () => { const r = revisar(src); assert.deepEqual(r.errores, []); r.avisos.forEach((a) => console.log("      ⚠ " + a)); });
console.log(`\n${ok} pasadas, ${mal} fallidas`); process.exit(mal ? 1 : 0);
