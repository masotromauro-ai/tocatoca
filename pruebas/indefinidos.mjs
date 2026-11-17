// pruebas/indefinidos.mjs — busca nombres que se usan sin estar definidos ni importados, en todo src/.
// Lo agregó la fase 2: al mover código de App.jsx a archivos nuevos, un import que falta no rompe la compilación,
// rompe recién cuando alguien toca esa pantalla. Usa el analizador de Babel que ya viene con vite (no agrega nada a package.json).
//   node pruebas/indefinidos.mjs
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const req = createRequire(path.join(raiz, "package.json"));
const { parse } = req("@babel/parser");
const traverse = (req("@babel/traverse").default || req("@babel/traverse"));

// Lo que el navegador y JavaScript ya traen
const GLOBALES = new Set(("window document localStorage sessionStorage navigator console Math JSON Date Array Object String Number Boolean Symbol Map Set WeakMap WeakSet Promise Error " +
  "parseInt parseFloat isNaN isFinite NaN Infinity undefined setTimeout clearTimeout setInterval clearInterval requestAnimationFrame cancelAnimationFrame URL Blob FileReader " +
  "Float32Array Float64Array Uint8Array Int16Array Uint16Array Int32Array Uint32Array ArrayBuffer AudioContext MediaStream Image Audio fetch alert confirm prompt performance " +
  "encodeURIComponent decodeURIComponent escape unescape RegExp Intl TextEncoder TextDecoder ResizeObserver IntersectionObserver MutationObserver Event CustomEvent KeyboardEvent " +
  "MouseEvent screen location history atob btoa structuredClone queueMicrotask globalThis HTMLElement Element Node getComputedStyle matchMedia process React " +
  // Fase 7 (17-nov-2026): la escucha en un AudioWorklet. Los tres últimos son del hilo del audio (AudioWorkletGlobalScope):
  // existen adentro del worklet, que es donde corre `procesadorEscucha` de shared/audio/mic.js.
  "AudioWorkletNode AudioWorkletProcessor sampleRate registerProcessor").split(" "));

export function indefinidos(codigo, nombre) {
  const ast = parse(codigo, { sourceType: "module", plugins: ["jsx"] });
  const faltan = new Map();
  traverse(ast, {
    ReferencedIdentifier(p) {
      const n = p.node.name;
      if (p.scope.hasBinding(n) || GLOBALES.has(n)) return;
      if (p.isJSXIdentifier() && /^[a-z]/.test(n)) return;           // <div>, <svg>: etiquetas, no variables
      if (!faltan.has(n)) faltan.set(n, p.node.loc.start.line);
    },
  });
  return [...faltan].map(([n, l]) => `${nombre}:${l}  «${n}» no está definido ni importado`);
}

function archivos(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? archivos(path.join(dir, e.name)) : [path.join(dir, e.name)]); }
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const src = path.join(raiz, "src"), malos = [];
  for (const f of archivos(src).filter((x) => /\.(jsx?|mjs)$/.test(x))) malos.push(...indefinidos(fs.readFileSync(f, "utf8"), path.relative(raiz, f)));
  // caso de control: la prueba tiene que ver un nombre que falta (si no, no prueba nada)
  const control = indefinidos("const a = nombreQueNoExiste + 1; export default a;", "control");
  if (control.length !== 1) { console.log("✖ el control no detectó el nombre que falta: la prueba no sirve."); process.exit(1); }
  malos.forEach((m) => console.log("  ✖ " + m));
  console.log(malos.length ? `\n${malos.length} nombre(s) sin definir.` : "✓ ningún nombre sin definir en src/ (con el control funcionando).");
  process.exit(malos.length ? 1 : 0);
}
