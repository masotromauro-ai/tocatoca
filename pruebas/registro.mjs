// pruebas/registro.mjs — la lógica del registro (public/cuenta/registro.js), con node a secas.
import assert from "node:assert/strict";
import { validar, paso, fichaNueva, fichaPendiente, rolPedido, causa, limpiarMail, AVISO_SPAM, REMITENTE } from "../public/cuenta/registro.js";
let ok = 0, mal = 0;
const t = (n, f) => { try { f(); ok++; } catch (e) { mal++; console.log("✖", n, e.message); } };
const bien = { mail: "Ana@X.com ", clave: "12345678", clave2: "12345678", nombre: "Ana" };
t("datos completos pasan", () => assert.equal(validar(bien), ""));
t("mail mal", () => assert.match(validar({ ...bien, mail: "ana" }), /mail/));
t("clave corta", () => assert.match(validar({ ...bien, clave: "123", clave2: "123" }), /8/));
t("claves distintas", () => assert.match(validar({ ...bien, clave2: "x2345678" }), /coinciden/));
t("sin nombre", () => assert.match(validar({ ...bien, nombre: " " }), /nombre/));
t("entrar no pide nombre ni repetir", () => assert.equal(validar({ mail: "a@b.co", clave: "x" }, false), ""));
t("mail se limpia", () => assert.equal(limpiarMail(" Ana@X.com "), "ana@x.com"));
t("pasos en orden", () => {
  assert.equal(paso({}), "entrar");
  assert.equal(paso({ usuario: 1 }), "verificar");
  assert.equal(paso({ usuario: 1, verificado: true }), "sin-invitacion");
  assert.equal(paso({ usuario: 1, verificado: true, invitacion: { rol: "admin" } }), "crear-ficha");
  assert.equal(paso({ usuario: 1, tieneFicha: true }), "listo");
});
t("la ficha trae sólo lo que dejan las reglas", () => {
  const f = fichaNueva("Ana@X.com", "Ana", { rol: "admin", usuario: "ana" });
  const permitidas = ["nombre", "mail", "rol", "activo", "usuario", "creado"];
  assert.ok(Object.keys(f).every((k) => permitidas.includes(k)));
  assert.equal(f.mail, "ana@x.com"); assert.equal(f.rol, "admin"); assert.equal(f.activo, true);
});
t("la ficha toma el rol de la invitación y no otro", () => assert.equal(fichaNueva("a@b.co", "A", { rol: "alumno" }).rol, "alumno"));
t("los errores se dicen en castellano", () => {
  assert.match(causa({ code: "auth/email-already-in-use" }), /ya tiene cuenta/);
  assert.match(causa({ code: "algo/raro" }), /algo\/raro/);
});
t("el aviso de Spam nombra la carpeta y el remitente", () => { assert.match(AVISO_SPAM, /Spam/); assert.ok(AVISO_SPAM.includes(REMITENTE)); });
// registro-4 / regla v3 (20-nov-2026, Mariano): la solicitud sin invitación, con la forma EXACTA que deja la regla.
t("la solicitud trae sólo lo que deja la regla v3: inactiva, alumno y lo que pidió", () => {
  const f = fichaPendiente(" Ana@X.com ", "Ana", "docente");
  assert.deepEqual(Object.keys(f).sort(), ["activo", "creado", "mail", "nombre", "pidio", "rol"]);
  assert.equal(f.activo, false); assert.equal(f.rol, "alumno"); assert.equal(f.pidio, "docente"); assert.equal(f.mail, "ana@x.com");
  assert.equal(fichaPendiente("a@b.co", "A", "admin").pidio, "alumno", "no se pide otra cosa que alumno o docente");
});
t("registro-5: el nombre de la solicitud, aun el de respaldo (lo de antes de la @), tiene hasta 60 letras", () => {
  assert.ok(fichaPendiente("x".repeat(64) + "@b.co", "", "alumno").nombre.length <= 60);
  assert.ok(fichaPendiente("a@b.co", "y".repeat(90), "alumno").nombre.length <= 60);
});
t("los links abiertos sólo piden alumno o docente", () => {
  assert.equal(rolPedido("?rol=alumno"), "alumno"); assert.equal(rolPedido("?rol=docente"), "docente");
  assert.equal(rolPedido("?rol=admin"), ""); assert.equal(rolPedido(""), "");
});
console.log(`${ok} pasadas, ${mal} fallidas`); process.exit(mal ? 1 : 0);
