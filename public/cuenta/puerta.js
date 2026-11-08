/* ═══════════════════════════════════════════════════════════
   cuenta/puerta.js — la puerta de la app: quién entra y qué ve.
   Sello: puerta-1 (8-nov-2026)

   Sin pantalla ni Firebase: src/Puerta.jsx es cableado. Lo que se decide
   (en qué paso está la persona, qué pestañas le tocan, con qué nombre la
   reconoce el Organizador viejo) vive acá y lo prueba pruebas/puerta.mjs.

   Mauro, 8-nov-2026: la app no puede abrirse sin cuenta. Se entra con el mail
   y la contraseña de /registro.html; el ROL de la ficha decide qué se ve
   (BASE.md, «La migración», paso 5).
   ═══════════════════════════════════════════════════════════ */
export const VERSION = "puerta-1";

/** En qué paso está la persona.
    · cargando      todavía no se sabe
    · sin-firebase  el SDK no bajó (sin conexión): no se puede comprobar nada
    · entrar        sin sesión
    · verificar     con sesión pero el mail sin confirmar
    · sin-ficha     mail confirmado y sin ficha: falta pasar por el registro
    · suspendido    ficha con activo != true
    · app           adentro */
export function fase({ listo, firebase, usuario, verificado, ficha }) {
  if (!listo) return "cargando";
  if (!firebase) return "sin-firebase";
  if (!usuario) return "entrar";
  if (ficha && ficha.activo === true) return "app";
  if (ficha) return "suspendido";
  if (!verificado) return "verificar";
  return "sin-ficha";
}

/** Lo que ve cada rol. Rol desconocido = alumno: ve lo menos. */
export function permisos(ficha) {
  const rol = ficha && ["admin", "docente", "alumno"].includes(ficha.rol) ? ficha.rol : "alumno";
  return {
    rol,
    alumno: rol === "alumno",          // Mis tareas, y no el Organizador
    organizador: rol !== "alumno",     // docente y admin arman clases
    usuarios: rol !== "alumno",        // la pantalla de Usuarios (el docente invita alumnos)
  };
}

/** El nombre con que la app vieja (clases.json, Mis tareas) reconoce al alumno:
    el usuario de la planilla si lo trae la ficha; si no, su nombre. */
export const usuarioDe = (ficha) => String((ficha && (ficha.usuario || ficha.nombre || (ficha.mail || "").split("@")[0])) || "").trim();

const CAUSAS = {
  "auth/invalid-credential": "Mail o contraseña incorrectos.",
  "auth/wrong-password": "Mail o contraseña incorrectos.",
  "auth/user-not-found": "No hay una cuenta con ese mail: registrate primero con tu invitación.",
  "auth/invalid-email": "Revisá el mail: no parece una dirección válida.",
  "auth/missing-email": "Escribí tu mail.",
  "auth/too-many-requests": "Demasiados intentos. Esperá unos minutos y volvé a probar.",
  "auth/network-request-failed": "No hay conexión. Revisá internet y volvé a probar.",
  "permission-denied": "La base no dejó leer tu ficha. Avisale a tu profesor.",
};
export const causa = (e) => CAUSAS[(e && e.code) || ""] || ("Algo falló: " + ((e && (e.code || e.message)) || "sin detalle") + ".");
