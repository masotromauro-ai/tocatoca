// herramientas/hook.mjs — saca un tramo de sentencias de un componente a un hook propio, SIN tocar su texto.
// Es para el único caso en que mover no alcanza: un componente de más de 400 líneas (regla 1 de ARQUITECTURA.md).
// Lo de adentro queda idéntico; se agregan sólo el encabezado de la función, un `return {…}` con lo que el resto
// del componente usa, y la llamada. Lo que el tramo necesita del componente entra como parámetro.
//   node herramientas/hook.mjs <plan.json> [--aplicar]
// Plan: { archivo, componente, destino, hooks: [{ nombre, desde, hasta }] }  (desde/hasta: renglones, los de la sentencia entera)
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const req = createRequire(path.join(process.cwd(), "package.json"));
const { parse } = req("@babel/parser");
const traverse = req("@babel/traverse").default || req("@babel/traverse");

export function planear(src, plan) {
  const ast = parse(src, { sourceType: "module", plugins: ["jsx"] });
  let fn = null, fnPath = null;
  traverse(ast, { FunctionDeclaration(p) { if (p.node.id && p.node.id.name === plan.componente && !fn) { fn = p.node; fnPath = p; } } });
  if (!fn) throw new Error("no encuentro el componente " + plan.componente);
  const cuerpo = fn.body.body, hooks = [], errores = [];
  for (const h of plan.hooks) {
    const stmts = cuerpo.filter((s) => s.loc.start.line >= h.desde && s.loc.end.line <= h.hasta);
    if (!stmts.length) { errores.push(`${h.nombre}: no hay sentencias entre ${h.desde} y ${h.hasta}`); continue; }
    const ini = stmts[0].start, fin = stmts[stmts.length - 1].end;
    const dentro = (n) => n.start >= ini && n.end <= fin;
    const declaradas = new Set(), params = new Set(), outs = new Set();
    fnPath.scope.traverse(fnPath.node, {});                                    // asegura los bindings
    for (const [nombre, b] of Object.entries(fnPath.scope.bindings)) {
      if (dentro(b.identifier)) declaradas.add(nombre);
    }
    traverse(ast, {
      Identifier(p) {
        if (!p.isReferencedIdentifier()) return;
        const b = fnPath.scope.getBinding(p.node.name); if (!b || b.scope !== fnPath.scope) return;
        const enTramo = dentro(p.node), declEnTramo = dentro(b.identifier);
        if (enTramo && !declEnTramo) { if (b.identifier.start > ini) errores.push(`${h.nombre}: «${p.node.name}» se declara después del tramo`); params.add(p.node.name); }
        if (!enTramo && declEnTramo && p.node.start > fin) outs.add(p.node.name);
        if (!enTramo && declEnTramo && p.node.start < ini) errores.push(`${h.nombre}: «${p.node.name}» se usa antes del tramo`);
      },
    });
    // lo escrito dentro del tramo (asignaciones a un binding de afuera) también es parámetro de entrada
    hooks.push({ ...h, ini, fin, texto: src.slice(ini, fin), params: [...params].sort(), outs: [...outs].sort() });
  }
  return { hooks, errores, ast };
}

export function generar(src, plan, p) {
  // 1 · el componente sin los tramos, con la llamada en el lugar del primero
  let nuevo = src;
  for (const h of [...p.hooks].sort((a, b) => b.ini - a.ini)) {
    const llamada = `const { ${h.outs.join(", ")} } = ${h.nombre}({ ${h.params.join(", ")} });`;
    nuevo = nuevo.slice(0, h.ini) + llamada + nuevo.slice(h.fin);
  }
  // 2 · el archivo de los hooks
  const imports = src.split("\n").filter((l) => /^import\b/.test(l));
  const cuerpo = p.hooks.map((h) => `export function ${h.nombre}({ ${h.params.join(", ")} }) {\n  ${h.texto}\n  return { ${h.outs.join(", ")} };\n}\n`).join("\n");
  const usa = (t, n) => new RegExp("(?<![\\w$])(?<!(?<![.])[.])" + n.replace(/\$/g, "\\$") + "(?![\\w$])").test(t);
  const podar = (lineas, texto) => lineas.map((l) => {
    const m = /^import\s*\{([^}]*)\}\s*from\s*(["'][^"']+["']);?$/.exec(l); if (!m) return l;
    const ns = m[1].split(",").map((x) => x.trim()).filter(Boolean).filter((n) => usa(texto, n));
    return ns.length ? `import { ${ns.join(", ")} } from ${m[2]};` : null;
  }).filter(Boolean);
  const nuevoPodado = (() => { const L = nuevo.split("\n"); const imps = L.filter((l) => /^import\b/.test(l)); const resto = L.filter((l) => !/^import\b/.test(l)).join("\n");
    const buenos = podar(imps, resto + "\n" + plan.hooks.map((h) => h.nombre).join(" ")); const importHooks = `import { ${p.hooks.map((h) => h.nombre).join(", ")} } from "./${path.basename(plan.destino)}";`;
    const out = []; let puesto = false; for (const l of L) { if (/^import\b/.test(l)) { if (!puesto) { out.push(...buenos, importHooks); puesto = true; } } else out.push(l); } return out.join("\n"); })();
  const hookImps = podar(imports, cuerpo);
  const archivo = `// ${plan.cabecera}\n\n${hookImps.join("\n")}\n\n${cuerpo}`;
  return { [plan.archivo]: nuevoPodado, [plan.destino]: archivo };
}

if (process.argv[1] && process.argv[1].endsWith("hook.mjs")) {
  const [pf, ...r] = process.argv.slice(2), aplicar = r.includes("--aplicar");
  const plan = JSON.parse(fs.readFileSync(pf, "utf8")), src = fs.readFileSync(plan.archivo, "utf8");
  const p = planear(src, plan);
  for (const h of p.hooks) console.log(`• ${h.nombre}: ${h.texto.split("\n").length} renglones · recibe { ${h.params.join(", ")} } · devuelve { ${h.outs.join(", ")} }`);
  if (p.errores.length) { console.log("\n✖ PROBLEMAS:"); p.errores.forEach((e) => console.log("   " + e)); process.exit(1); }
  if (!aplicar) { console.log("\nSin problemas. Corré con --aplicar."); process.exit(0); }
  for (const [f, t] of Object.entries(generar(src, plan, p))) { fs.writeFileSync(f, t); console.log("  escrito", f, t.split("\n").length + " líneas"); }
}
