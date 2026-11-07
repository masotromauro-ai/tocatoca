// pruebas/registro.mjs — la lógica del registro (public/cuenta/registro.js), con node a secas.
import assert from "node:assert/strict";
import { validar, paso, fichaNueva, causa, limpiarMail } from "../public/cuenta/registro.js";
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
console.log(`${ok} pasadas, ${mal} fallidas`); process.exit(mal ? 1 : 0);
