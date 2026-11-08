// pruebas/puerta.mjs — la puerta de la app (public/cuenta/puerta.js), con node a secas.
import assert from "node:assert/strict";
import { fase, permisos, usuarioDe, causa } from "../public/cuenta/puerta.js";
let ok = 0, mal = 0;
const t = (n, f) => { try { f(); ok++; } catch (e) { mal++; console.log("✖", n, e.message); } };
const u = { uid: "x" };
t("mientras no se sabe, cargando; sin SDK, no se entra", () => {
  assert.equal(fase({ listo: false }), "cargando");
  assert.equal(fase({ listo: true, firebase: false, usuario: u, ficha: { activo: true } }), "sin-firebase");
});
t("sin sesión: entrar", () => assert.equal(fase({ listo: true, firebase: true }), "entrar"));
t("con ficha activa: adentro (aunque el mail sea viejo y no figure verificado)", () =>
  assert.equal(fase({ listo: true, firebase: true, usuario: u, verificado: false, ficha: { activo: true } }), "app"));
t("ficha suspendida o sin activo: no entra", () => {
  assert.equal(fase({ listo: true, firebase: true, usuario: u, verificado: true, ficha: { activo: false } }), "suspendido");
  assert.equal(fase({ listo: true, firebase: true, usuario: u, verificado: true, ficha: {} }), "suspendido");
  assert.equal(fase({ listo: true, firebase: true, usuario: u, verificado: true, ficha: { activo: "true" } }), "suspendido");
});
t("sin ficha: a verificar el mail o a terminar el registro", () => {
  assert.equal(fase({ listo: true, firebase: true, usuario: u, verificado: false, ficha: null }), "verificar");
  assert.equal(fase({ listo: true, firebase: true, usuario: u, verificado: true, ficha: null }), "sin-ficha");
});
t("el alumno ve Mis tareas; docente y admin, Organizador y Usuarios", () => {
  assert.deepEqual(permisos({ rol: "alumno" }), { rol: "alumno", alumno: true, organizador: false, usuarios: false });
  assert.deepEqual(permisos({ rol: "docente" }), { rol: "docente", alumno: false, organizador: true, usuarios: true });
  assert.deepEqual(permisos({ rol: "admin" }), { rol: "admin", alumno: false, organizador: true, usuarios: true });
});
t("un rol desconocido ve lo de un alumno, nunca más", () => {
  assert.equal(permisos({ rol: "superadmin" }).alumno, true); assert.equal(permisos(null).organizador, false);
});
t("el nombre para la app vieja: usuario de la planilla, si no el nombre, si no el mail", () => {
  assert.equal(usuarioDe({ usuario: "maria", nombre: "María" }), "maria");
  assert.equal(usuarioDe({ nombre: " María " }), "María");
  assert.equal(usuarioDe({ mail: "ana@x.com" }), "ana");
  assert.equal(usuarioDe(null), "");
});
t("los errores se dicen en castellano", () => {
  assert.match(causa({ code: "auth/invalid-credential" }), /incorrectos/);
  assert.match(causa({ code: "auth/raro" }), /auth\/raro/);
});
console.log(`${ok} pasadas, ${mal} fallidas`); process.exit(mal ? 1 : 0);
