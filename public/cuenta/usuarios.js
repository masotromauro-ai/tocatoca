/* ═══════════════════════════════════════════════════════════
   cuenta/usuarios.js — la lógica de la pantalla de Usuarios, sin pantalla ni
   Firebase. Sello: usuarios-1 (7-nov-2026)

   usuarios.html es cableado: quién puede tocar a quién, qué invitación sirve,
   qué queda pendiente y el mensaje para mandarle a alguien viven acá, y los
   prueba pruebas/usuarios.mjs con node a secas. La GARANTÍA son las reglas
   (firestore.rules); esto es para que la pantalla no ofrezca lo que la base
   va a rechazar, y para que nadie se quede afuera por un toque.
   ═══════════════════════════════════════════════════════════ */
import { limpiarMail } from "./registro.js";
export const VERSION = "usuarios-1";

export const ROLES = ["admin", "docente", "alumno"];
export const NOMBRE_ROL = { admin: "Administrador", docente: "Docente", alumno: "Alumno" };
export const LINK_REGISTRO = "https://tocatoca-il7f.vercel.app/registro.html";

/** ¿Puede entrar a esta pantalla? Admin y docente sí; alumno o suspendido, no. */
export const puedeVer = (yo) => !!yo && yo.activo === true && (yo.rol === "admin" || yo.rol === "docente");

/** ¿Puede cambiarle rol, estado o «probador» a otro? Sólo un admin, y nunca a sí mismo
    (así nadie se saca el acceso de un toque; a otro admin, sí). */
export const puedeEditar = (yo, otro) => !!yo && yo.rol === "admin" && yo.activo === true && !!otro && otro.id !== yo.id;

/** Los roles que yo puedo dar en una invitación. */
export const rolesQueInvita = (yo) => (!yo ? [] : yo.rol === "admin" ? ROLES : yo.rol === "docente" ? ["alumno"] : []);

/** Un cambio que dejaría la base sin ningún administrador activo, no se hace. */
export function dejaSinAdmin(lista, id, cambio) {
  const despues = lista.map((u) => (u.id === id ? { ...u, ...cambio } : u));
  return !despues.some((u) => u.rol === "admin" && u.activo === true);
}

/** Lo que está mal en una invitación nueva; "" si sirve. */
export function validarInvitacion({ mail, rol, usuario }, yo, usuarios = [], invitaciones = []) {
  const m = limpiarMail(mail);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) return "Revisá el mail: no parece una dirección válida.";
  if (!rolesQueInvita(yo).includes(rol)) return yo && yo.rol === "docente" ? "Un docente invita sólo alumnos." : "No podés invitar con ese rol.";
  if (usuarios.some((u) => limpiarMail(u.mail) === m)) return "Esa persona ya tiene cuenta: cambiale el rol en la lista de abajo.";
  if (invitaciones.some((i) => i.id === m)) return "Ya hay una invitación para ese mail.";
  if (usuario && !/^[A-Za-z0-9._-]{2,30}$/.test(String(usuario).trim())) return "El usuario viejo va sin espacios (letras, números, punto, guion).";
  return "";
}

/** El documento de la invitación, con lo que leen las reglas y el registro. */
export function invitacionNueva({ rol, usuario }, yo) {
  const i = { rol, por: (yo && (yo.nombre || yo.mail)) || "", creado: Date.now() };
  if (usuario && String(usuario).trim()) i.usuario = String(usuario).trim();
  return i;
}

/** Las invitaciones que todavía nadie usó (no hay ficha con ese mail). */
export const pendientes = (invitaciones, usuarios) => {
  const con = new Set(usuarios.map((u) => limpiarMail(u.mail)));
  return invitaciones.filter((i) => !con.has(limpiarMail(i.id))).sort((a, b) => (b.creado || 0) - (a.creado || 0));
};

/** La lista de personas: activos primero, por rol y por nombre. */
export const ordenar = (usuarios) => [...usuarios].sort((a, b) =>
  (b.activo === true) - (a.activo === true)
  || ROLES.indexOf(a.rol) - ROLES.indexOf(b.rol)
  || String(a.nombre || a.mail || "").localeCompare(String(b.nombre || b.mail || ""), "es"));

/** El mensaje para mandarle a quien se invitó (por WhatsApp o mail, lo manda una persona). */
export function mensajeInvitacion(mail, rol) {
  const r = (NOMBRE_ROL[rol] || rol).toLowerCase();
  return `Hola! Te invitamos a BandoMaps como ${r}. Registrate en ${LINK_REGISTRO} con este mail: ${limpiarMail(mail)}. `
    + `Elegí una contraseña y confirmá el mail con el enlace que te llega (si no lo ves, buscalo en Spam).`;
}
