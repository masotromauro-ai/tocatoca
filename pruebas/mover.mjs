// pruebas/mover.mjs — banco de herramientas/mover.mjs. Sin npm ni red:  node pruebas/mover.mjs
import assert from "node:assert/strict";
import { renglones, comparar } from "../herramientas/mover.mjs";
let ok = 0, mal = 0;
const t = (n, f) => { try { f(); ok++; console.log("  ✓ " + n); } catch (e) { mal++; console.log("  ✗ " + n + "\n      " + e.message); } };

const ANTES = `import { useState } from "react";
import {
  a,
  b,
} from "./x.js";

const A = 1;
function uno(){ return A; }
export default function Raiz(){ return uno(); }
`;
t("los import (también de varios renglones), el export y los vacíos no cuentan", () =>
  assert.deepEqual(renglones(ANTES), ["const A = 1;", "function uno(){ return A; }", "function Raiz(){ return uno(); }"]));
t("mover un tramo a otro archivo, con sus import y export, da ok", () => {
  const r = comparar(ANTES, ['import { A } from "./a.js";\nexport function uno(){ return A; }', 'export const A = 1;\nexport default function Raiz(){ return uno(); }']);
  assert.equal(r.ok, true);
});
t("un renglón cambiado se detecta de los dos lados", () => {
  const r = comparar(ANTES, ["const A = 2;\nfunction uno(){ return A; }\nfunction Raiz(){ return uno(); }"]);
  assert.equal(r.ok, false); assert.equal(r.faltan[0].renglon, "const A = 1;"); assert.equal(r.sobran[0].renglon, "const A = 2;");
});
t("un renglón que desaparece falla", () => assert.equal(comparar(ANTES, ["const A = 1;\nfunction uno(){ return A; }"]).ok, false));
t("un renglón repetido tiene que seguir repetido: moverlo y perder una copia falla", () => {
  const dos = "const x = 1;\nconst y = 2;\nconst x = 1;";
  assert.equal(comparar(dos, ["const x = 1;\nconst y = 2;"]).ok, false);
  assert.equal(comparar(dos, ["const x = 1;", "const y = 2;\nconst x = 1;"]).ok, true);
});
t("el orden y la sangría no importan", () => assert.equal(comparar("  a();\n    b();", ["b();\na();"]).ok, true));
t("agregar código nuevo (no sólo mover) falla", () => assert.equal(comparar("a();", ["a();\nb();"]).ok, false));
t("los comentarios sueltos no cuentan, pero un comentario al final de un renglón de código viaja con él", () => {
  assert.equal(comparar("a(); // uno\n/* dos\n tres */\nb();", ["// cabecera nueva\na(); // uno\nb();"]).ok, true);
  assert.equal(comparar("a(); // uno", ["a(); // otro"]).ok, false);
});
console.log(`\n${ok} pasadas, ${mal} fallidas`); process.exit(mal ? 1 : 0);
