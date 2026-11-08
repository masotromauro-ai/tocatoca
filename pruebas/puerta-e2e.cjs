// pruebas/puerta-e2e.cjs — la puerta de la app (src/Puerta.jsx) y «Invitar varios»
// de Usuarios, de punta a punta contra los emuladores de Firebase (nunca la base real).
// Se corre igual que pruebas/usuarios-e2e.cjs (ver su cabecera): dist/ servido en
// el puerto 4176 y los emuladores de firestore (8089) y auth (9099).
const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const P = "tocatoca-621a5", FS = "http://127.0.0.1:8089/v1/projects/" + P + "/databases/(default)/documents", AU = "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1";
const owner = { authorization: "Bearer owner", "content-type": "application/json" };
const val = (v) => typeof v === "boolean" ? { booleanValue: v } : typeof v === "number" ? { integerValue: String(v) } : { stringValue: v };
const fields = (o) => ({ fields: Object.fromEntries(Object.entries(o).map(([k, v]) => [k, val(v)])) });
async function usuario(mail, clave, ficha) {
  const r = await (await fetch(AU + "/accounts:signUp?key=x", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: mail, password: clave, returnSecureToken: true }) })).json();
  if (ficha) await fetch(FS + "/usuarios?documentId=" + r.localId, { method: "POST", headers: owner, body: JSON.stringify(fields({ mail, activo: true, ...ficha })) });
  return r.localId;
}
const leer = async (c) => ((await (await fetch(FS + "/" + c, { headers: owner })).json()).documents || []);
(async () => {
  let ok = 0, mal = 0; const t = (n, c) => { if (c) ok++; else { mal++; console.log("✖", n); } };
  await usuario("admin@x.com", "clave1234", { nombre: "Admin", rol: "admin" });
  await usuario("doc@x.com", "clave1234", { nombre: "Doc", rol: "docente" });
  const aluId = await usuario("alu@x.com", "clave1234", { nombre: "Alu", rol: "alumno", usuario: "alu_viejo" });
  await usuario("nueva@x.com", "clave1234", null);
  await fetch(FS + "/invitaciones?documentId=ya@x.com", { method: "POST", headers: owner, body: JSON.stringify(fields({ rol: "alumno" })) });
  const fb = fs.readFileSync(path.join(__dirname, "..", "dist", "cuenta", "firebase.js"), "utf8").replace('auth.languageCode = "es";',
    'auth.languageCode = "es"; au.connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });')
    .replace("db = fs.getFirestore(app);", 'db = fs.getFirestore(app); fs.connectFirestoreEmulator(db, "127.0.0.1", 8089);');
  const b = await chromium.launch(); const errs = [];
  const nueva = async () => { const ctx = await b.newContext({ viewport: { width: 390, height: 900 } });
    await ctx.route("**/cuenta/firebase.js", (r) => r.fulfill({ contentType: "text/javascript", body: fb }));
    const p = await ctx.newPage(); p.on("pageerror", (e) => errs.push(e.message)); p.on("dialog", (d) => d.accept()); return p; };
  const entrar = async (p, m, c = "clave1234") => { await p.goto("http://localhost:4176/"); await p.waitForSelector("#pMail");
    await p.fill("#pMail", m); await p.fill("#pClave", c); await p.click("#pEntrar"); await p.waitForTimeout(4000); };
  const cuerpo = (p) => p.textContent("body");

  // Sin sesión: sólo la puerta
  let p = await nueva(); await p.goto("http://localhost:4176/"); await p.waitForSelector("#pMail", { timeout: 15000 });
  let tx = await cuerpo(p);
  t("sin sesión se ve la puerta y no la app", tx.includes("Registrate con el mail de tu invitación") && !tx.includes("Herramientas"));
  await entrar(p, "alu@x.com", "malisima1");
  t("contraseña equivocada: lo dice", (await cuerpo(p)).includes("Mail o contraseña incorrectos"));

  // Alumno
  await p.fill("#pClave", "clave1234"); await p.click("#pEntrar"); await p.waitForTimeout(3000);
  tx = await cuerpo(p);
  t("el alumno entra a la app", tx.includes("Herramientas"));
  t("el alumno ve Mis tareas y no el Organizador", tx.includes("Mis tareas") && !tx.includes("Organizador"));
  t("el alumno no ve el botón de Usuarios", !(await p.isVisible("a[href='/usuarios.html']")));
  t("el alumno se llama como en la planilla vieja", (await p.evaluate(() => window.__USUARIO)) === "alu_viejo");
  t("se ve Salir con su nombre", tx.includes("Salir (Alu)"));
  // Suspendido EN VIVO: la app se cierra sola
  await fetch(FS + "/usuarios/" + aluId + "?updateMask.fieldPaths=activo", { method: "PATCH", headers: owner, body: JSON.stringify(fields({ activo: false })) });
  await p.waitForTimeout(2500);
  tx = await cuerpo(p);
  t("si lo suspenden, la app se cierra sola", tx.includes("Tu cuenta está suspendida") && !tx.includes("Herramientas"));
  await p.click("text=Salir"); await p.waitForTimeout(1500);
  t("Salir vuelve a la puerta", await p.isVisible("#pMail"));
  // Al recargar con sesión, no pide de nuevo
  await entrar(p, "doc@x.com"); await p.reload(); await p.waitForTimeout(3500);
  tx = await cuerpo(p);
  t("el docente entra y la sesión sobrevive a recargar", tx.includes("Herramientas"));
  t("el docente ve el Organizador y no Mis tareas", tx.includes("Organizador") && !tx.includes("Mis tareas"));
  t("el docente ve el botón de Usuarios", await p.isVisible("a[href='/usuarios.html']"));

  // Cuenta sin ficha
  p = await nueva(); await entrar(p, "nueva@x.com");
  tx = await cuerpo(p);
  t("cuenta sin ficha ni mail confirmado: al registro, sin app", tx.includes("Te falta confirmar tu mail") && tx.includes("Ir al registro") && !tx.includes("Herramientas"));

  // Admin: invitar varios
  p = await nueva(); await entrar(p, "admin@x.com");
  tx = await cuerpo(p); t("el admin entra", tx.includes("Organizador"));
  await p.click("a[href='/usuarios.html']"); await p.waitForFunction(() => document.getElementById("quienSoy").textContent.includes("Admin"), null, { timeout: 15000 });
  t("de la app a Usuarios sin volver a entrar", await p.isVisible("#fVarios"));
  await p.fill("#vLista", "uno@x.com, uno\ndos@x.com\nya@x.com\nmalo");
  await p.click("#bVarios"); await p.waitForTimeout(4000);
  const inv = (await leer("invitaciones")).map((d) => d.name.split("/").pop());
  t("se crearon las dos que servían", inv.includes("uno@x.com") && inv.includes("dos@x.com"));
  const uno = (await leer("invitaciones")).find((d) => d.name.endsWith("/uno@x.com"));
  t("con su usuario viejo y rol alumno", uno.fields.usuario.stringValue === "uno" && uno.fields.rol.stringValue === "alumno");
  t("las que no servían quedan en la lista con su motivo", (await p.inputValue("#vLista")) === "ya@x.com\nmalo" && (await p.textContent("#vMal")).includes("Ya hay una invitación"));
  t("ningún error de página", errs.length === 0);
  if (errs.length) console.log(errs);
  await b.close();
  console.log(`${ok} pasadas, ${mal} fallidas`); process.exit(mal ? 1 : 0);
})();
