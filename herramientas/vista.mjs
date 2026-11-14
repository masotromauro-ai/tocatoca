// herramientas/vista.mjs — saca de un componente el bloque `{tab==="x"&&( … )}` a su propio componente, SIN tocar su texto.
// El estado se queda donde está (en la raíz): lo que el bloque usa del componente entra como props. Así lo que escribió
// el alumno en una pestaña no se pierde al cambiar de pestaña, que es lo que pasaría si el estado se mudara con el bloque.
//   node herramientas/vista.mjs <plan.json> [--aplicar]
// Plan: { archivo, componente, bloques: [{ linea, nombre, destino, cabecera }] }   (linea: el renglón donde abre el bloque)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const req = createRequire(path.join(process.cwd(), "package.json"));
const { parse } = req("@babel/parser");
const traverse = req("@babel/traverse").default || req("@babel/traverse");
const usa = (t, n) => new RegExp("(?<![\\w$])(?<!(?<![.])[.])" + n.replace(/\$/g, "\\$") + "(?![\\w$])").test(t);

export function planear(src, plan) {
  const ast = parse(src, { sourceType: "module", plugins: ["jsx"] });
  let fnPath = null;
  traverse(ast, { FunctionDeclaration(p) { if (p.node.id && p.node.id.name === plan.componente && !fnPath) fnPath = p; } });
  if (!fnPath) throw new Error("no encuentro " + plan.componente);
  const errores = [], bloques = [];
  for (const b of plan.bloques) {
    let hallado = null;
    traverse(ast, { JSXExpressionContainer(p) {
      const e = p.node.expression;
      if (e.type === "LogicalExpression" && e.operator === "&&" && e.loc.start.line === b.linea && !hallado) hallado = p.node;
    } });
    if (!hallado) { errores.push(`${b.nombre}: no hay un bloque «cond && (…)» que abra en el renglón ${b.linea}`); continue; }
    const der = hallado.expression.right, ini = der.start, fin = der.end;
    const dentro = (n) => n.start >= ini && n.end <= fin;
    const props = new Set();
    traverse(ast, { Identifier(p) {
      if (!dentro(p.node) || !p.isReferencedIdentifier()) return;
      const bd = fnPath.scope.getBinding(p.node.name); if (bd && bd.scope === fnPath.scope && !dentro(bd.identifier)) props.add(p.node.name);
    } });
    // un JSX adentro (`<Foo/>`) referencia por JSXIdentifier: no es un binding del componente, queda como import
    bloques.push({ ...b, ini, fin, texto: src.slice(ini, fin), props: [...props].sort() });
  }
  return { bloques, errores };
}

export function generar(src, plan, p) {
  let nuevo = src;
  for (const b of [...p.bloques].sort((a, c) => c.ini - a.ini))
    nuevo = nuevo.slice(0, b.ini) + `<${b.nombre} ${b.props.map((n) => `${n}={${n}}`).join(" ")}/>` + nuevo.slice(b.fin);
  const imports = src.split("\n").filter((l) => /^import\b/.test(l));
  const podar = (lineas, texto, ajustar) => lineas.map((l) => {
    const m = /^import\s*\{([^}]*)\}\s*from\s*(["'])([^"']+)\2;?$/.exec(l); if (!m) return /^import\s+\w/.test(l) && usa(texto, l.split(/\s+/)[1]) ? l : null;
    const ns = m[1].split(",").map((x) => x.trim()).filter(Boolean).filter((n) => usa(texto, n));
    const ruta = ajustar ? ajustar(m[3]) : m[3];
    return ns.length ? `import { ${ns.join(", ")} } from "${ruta}";` : null;
  }).filter(Boolean);
  const salida = {};
  for (const b of p.bloques) {
    const cuerpo = `export function ${b.nombre}({ ${b.props.join(", ")} }) {\n  return (\n    ${b.texto}\n  );\n}\n`;
    const ajustar = (r) => { if (!r.startsWith(".")) return r; let x = path.posix.relative(path.posix.dirname(b.destino), path.posix.join(path.posix.dirname(plan.archivo), r)); if (!x.startsWith(".")) x = "./" + x; return x; };
    const imps = podar(imports, cuerpo, ajustar);
    salida[b.destino] = `// ${b.cabecera}\n\n${imps.join("\n")}\n\n${cuerpo}`;
  }
  const L = nuevo.split("\n"), resto = L.filter((l) => !/^import\b/.test(l)).join("\n");
  const nuevosImports = p.bloques.map((b) => { let x = path.posix.relative(path.posix.dirname(plan.archivo), b.destino); if (!x.startsWith(".")) x = "./" + x; return `import { ${b.nombre} } from "${x}";`; });
  const buenos = podar(L.filter((l) => /^import\b/.test(l)), resto + nuevosImports.join("\n"));
  const out = []; let puesto = false;
  for (const l of L) { if (/^import\b/.test(l)) { if (!puesto) { out.push(...buenos, ...nuevosImports); puesto = true; } } else out.push(l); }
  salida[plan.archivo] = out.join("\n");
  return salida;
}

if (process.argv[1] && process.argv[1].endsWith("vista.mjs")) {
  const [pf, ...r] = process.argv.slice(2), aplicar = r.includes("--aplicar");
  const plan = JSON.parse(fs.readFileSync(pf, "utf8")), src = fs.readFileSync(plan.archivo, "utf8");
  const p = planear(src, plan);
  for (const b of p.bloques) console.log(`• ${b.nombre}: ${b.texto.split("\n").length} renglones · props: ${b.props.join(", ")}`);
  if (p.errores.length) { console.log("\n✖ PROBLEMAS:"); p.errores.forEach((e) => console.log("   " + e)); process.exit(1); }
  if (!aplicar) { console.log("\nSin problemas. Corré con --aplicar."); process.exit(0); }
  for (const [f, t] of Object.entries(generar(src, plan, p))) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, t); console.log("  escrito", f, t.split("\n").length + " líneas"); }
}
