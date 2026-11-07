// pruebas/usuarios-e2e.cjs — la pantalla de Usuarios de punta a punta, contra los
// emuladores de Firebase (cuentas y base de prueba; nunca la base real).
// Necesita Java, el emulador y Playwright; no agrega nada a package.json:
//   npm run build && npx vite preview --port 4176 --strictPort &
//   (en una carpeta aparte, con firebase-tools: firebase.json con firestore en 8089
//    y auth en 9099, y reglas.rules = firestore.rules con UID-DEL-AGENTE -> agente)
//   npx firebase emulators:exec --only firestore,auth --project tocatoca-621a5 //     "node <ruta a este archivo>"
// Sirve la página publicada (dist/) cambiando sólo cuenta/firebase.js para que
// apunte a los emuladores. 17 casos.
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
  const aluId = await usuario("alu@x.com", "clave1234", { nombre: "Alu", rol: "alumno" });
  const fb = fs.readFileSync(path.join(__dirname, "..", "dist", "cuenta", "firebase.js"), "utf8").replace('auth.languageCode = "es";',
    'auth.languageCode = "es"; au.connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });')
    .replace("db = fs.getFirestore(app);", 'db = fs.getFirestore(app); fs.connectFirestoreEmulator(db, "127.0.0.1", 8089);');
  const b = await chromium.launch(); const errs = [];
  const nueva = async () => { const ctx = await b.newContext({ viewport: { width: 390, height: 900 } });
    await ctx.route("**/cuenta/firebase.js", (r) => r.fulfill({ contentType: "text/javascript", body: fb }));
    const p = await ctx.newPage(); p.on("pageerror", (e) => errs.push(e.message)); p.on("dialog", (d) => d.accept()); return p; };
  const entrar = async (p, m) => { await p.goto("http://localhost:4176/usuarios.html"); await p.waitForSelector("#fEntrar:not(.oculto)");
    await p.fill("#mail", m); await p.fill("#clave", "clave1234"); await p.click("#bEntrar"); await p.waitForTimeout(2500); };
  // Admin
  let p = await nueva(); await entrar(p, "admin@x.com");
  t("admin ve el panel", await p.isVisible("#sPanel"));
  t("admin ve 3 personas", (await p.textContent("#nPers")) === "3");
  t("admin puede invitar los 3 roles", (await p.$$eval("#iRol option", (o) => o.length)) === 3);
  t("su propio selector está apagado", await p.$eval(`#lPers .chip.yo`, (el) => el.closest(".persona").querySelector("select").disabled));
  await p.fill("#iMail", "Nueva@X.com"); await p.selectOption("#iRol", "alumno"); await p.fill("#iUsuario", "nueva"); await p.click("#bInvitar"); await p.waitForTimeout(1500);
  t("la invitación aparece pendiente", (await p.textContent("#lPend")).includes("nueva@x.com"));
  const inv = await leer("invitaciones"); t("la invitación está en la base con rol y usuario", inv.some((d) => d.name.endsWith("/nueva@x.com") && d.fields.rol.stringValue === "alumno" && d.fields.usuario.stringValue === "nueva"));
  await p.fill("#iMail", "nueva@x.com"); await p.click("#bInvitar"); await p.waitForTimeout(800);
  t("no deja invitar dos veces", (await p.textContent("#msg")).includes("Ya hay"));
  await p.selectOption(`select[data-rol="${aluId}"]`, "docente"); await p.waitForTimeout(1500);
  let us = await leer("usuarios"); t("cambiar el rol queda en la base", us.find((d) => d.name.endsWith(aluId)).fields.rol.stringValue === "docente");
  await p.click(`button[data-activo="${aluId}"]`); await p.waitForTimeout(1500);
  us = await leer("usuarios"); t("suspender queda en la base", us.find((d) => d.name.endsWith(aluId)).fields.activo.booleanValue === false);
  t("y se ve suspendido", (await p.textContent("#lPers")).includes("suspendido"));
  await p.click(`button[data-quitar="nueva@x.com"]`); await p.waitForTimeout(1500);
  t("quitar la invitación la borra", !(await leer("invitaciones")).some((d) => d.name.endsWith("/nueva@x.com")));
  if (process.env.FOTO) await p.screenshot({ path: process.env.FOTO, fullPage: true });
  await p.click("#bSalir"); await p.waitForTimeout(800); t("salir vuelve a Entrar", await p.isVisible("#fEntrar"));
  // Docente
  p = await nueva(); await entrar(p, "doc@x.com");
  t("docente ve el panel", await p.isVisible("#sPanel"));
  t("docente invita sólo alumnos", (await p.$$eval("#iRol option", (o) => o.map((x) => x.value).join())) === "alumno");
  t("docente no tiene selectores activos", await p.$$eval("#lPers select", (s) => s.every((x) => x.disabled)));
  // Alumno suspendido (el de arriba) y uno común
  await usuario("alu2@x.com", "clave1234", { nombre: "Alu2", rol: "alumno" });
  p = await nueva(); await entrar(p, "alu2@x.com");
  t("alumno no entra", await p.isVisible("#sSinPermiso"));
  t("sin errores de página", errs.length === 0); if (errs.length) console.log(errs.slice(0, 3));
  console.log(`${ok} pasadas, ${mal} fallidas`); await b.close(); process.exit(mal ? 1 : 0);
})();
