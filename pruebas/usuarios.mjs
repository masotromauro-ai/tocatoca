// pruebas/usuarios.mjs — la lógica de la pantalla de Usuarios (public/cuenta/usuarios.js), con node a secas.
import assert from "node:assert/strict";
import { puedeVer, puedeEditar, rolesQueInvita, dejaSinAdmin, validarInvitacion, invitacionNueva, pendientes, ordenar, mensajeInvitacion, leerLista, LINK_REGISTRO } from "../public/cuenta/usuarios.js";
let ok = 0, mal = 0;
const t = (n, f) => { try { f(); ok++; } catch (e) { mal++; console.log("✖", n, e.message); } };
const admin = { id: "a", rol: "admin", activo: true, nombre: "Mauro", mail: "m@x.com" };
const admin2 = { id: "a2", rol: "admin", activo: true, nombre: "Mariano", mail: "mar@x.com" };
const doc = { id: "d", rol: "docente", activo: true, nombre: "Doc", mail: "d@x.com" };
const alu = { id: "u", rol: "alumno", activo: true, nombre: "Ana", mail: "ana@x.com" };
const baja = { id: "b", rol: "alumno", activo: false, nombre: "Beto", mail: "b@x.com" };
t("entran admin y docente; alumno y suspendido no", () => {
  assert.ok(puedeVer(admin)); assert.ok(puedeVer(doc)); assert.ok(!puedeVer(alu)); assert.ok(!puedeVer({ ...admin, activo: false })); assert.ok(!puedeVer(null));
});
t("un admin edita a otros, nunca a sí mismo", () => { assert.ok(puedeEditar(admin, alu)); assert.ok(puedeEditar(admin, admin2)); assert.ok(!puedeEditar(admin, admin)); });
t("un docente no edita a nadie", () => assert.ok(!puedeEditar(doc, alu)));
t("roles que se invitan", () => { assert.deepEqual(rolesQueInvita(admin), ["admin", "docente", "alumno"]); assert.deepEqual(rolesQueInvita(doc), ["alumno"]); assert.deepEqual(rolesQueInvita(alu), []); });
t("no se deja la base sin admin", () => {
  assert.ok(dejaSinAdmin([admin, alu], "a", { activo: false }));
  assert.ok(dejaSinAdmin([admin, alu], "a", { rol: "docente" }));
  assert.ok(!dejaSinAdmin([admin, admin2, alu], "a2", { activo: false }));
  assert.ok(!dejaSinAdmin([admin, alu], "u", { rol: "docente" }));
});
t("invitación buena", () => assert.equal(validarInvitacion({ mail: " Nuevo@X.com", rol: "alumno" }, admin, [admin], []), ""));
t("invitación: mail malo, rol no permitido, ya tiene cuenta, ya invitado", () => {
  assert.match(validarInvitacion({ mail: "x", rol: "alumno" }, admin), /mail/);
  assert.match(validarInvitacion({ mail: "n@x.com", rol: "docente" }, doc), /sólo alumnos/);
  assert.match(validarInvitacion({ mail: "ANA@x.com", rol: "alumno" }, admin, [alu]), /ya tiene cuenta/);
  assert.match(validarInvitacion({ mail: "n@x.com", rol: "alumno" }, admin, [], [{ id: "n@x.com" }]), /Ya hay/);
  assert.match(validarInvitacion({ mail: "n@x.com", rol: "alumno", usuario: "con espacio" }, admin), /sin espacios/);
});
t("la invitación lleva el rol y el usuario viejo si hay", () => {
  const i = invitacionNueva({ rol: "alumno", usuario: " ana " }, admin);
  assert.equal(i.rol, "alumno"); assert.equal(i.usuario, "ana"); assert.equal(i.por, "Mauro");
  assert.ok(!("usuario" in invitacionNueva({ rol: "alumno", usuario: "" }, admin)));
});
t("pendientes: las que nadie usó, la más nueva arriba", () => {
  const p = pendientes([{ id: "ana@x.com", creado: 1 }, { id: "z@x.com", creado: 2 }, { id: "y@x.com", creado: 3 }], [alu]);
  assert.deepEqual(p.map((i) => i.id), ["y@x.com", "z@x.com"]);
});
t("orden: activos primero, por rol y nombre", () => assert.deepEqual(ordenar([baja, alu, doc, admin2, admin]).map((u) => u.id), ["a2", "a", "d", "u", "b"]));
t("el mensaje lleva el link, el mail y el aviso de Spam", () => {
  const m = mensajeInvitacion("Ana@X.com", "alumno");
  assert.ok(m.includes(LINK_REGISTRO)); assert.ok(m.includes("ana@x.com")); assert.match(m, /alumno/); assert.match(m, /Spam/);
});
t("invitar varios: mail, o mail y usuario viejo; coma, punto y coma o tabulador", () => {
  const r = leerLista("Ana2@x.com, ana\n\n  juan@x.com \npedro@x.com;pedro\nlu@x.com\tlu", "alumno", admin, [alu], []);
  assert.deepEqual(r.ok.map((p) => [p.mail, p.usuario]), [["ana2@x.com", "ana"], ["juan@x.com", ""], ["pedro@x.com", "pedro"], ["lu@x.com", "lu"]]);
  assert.equal(r.mal.length, 0);
});
t("invitar varios: lo que no sirve queda aparte con su motivo, y nada se repite", () => {
  const r = leerLista("ana@x.com\nnoesmail\nz@x.com\nq@x.com\nq@x.com\nw@x.com, con espacio", "alumno", admin, [alu], [{ id: "z@x.com" }]);
  assert.deepEqual(r.ok.map((p) => p.mail), ["q@x.com"]);
  assert.deepEqual(r.mal.map((x) => x.linea), ["ana@x.com", "noesmail", "z@x.com", "q@x.com", "w@x.com, con espacio"]);
  assert.ok(r.mal.every((x) => x.motivo));
});
t("invitar varios: un docente no invita docentes de a muchos tampoco", () => {
  const r = leerLista("x@x.com", "docente", doc, [], []); assert.equal(r.ok.length, 0); assert.match(r.mal[0].motivo, /sólo alumnos/);
});
console.log(`${ok} pasadas, ${mal} fallidas`); process.exit(mal ? 1 : 0);
