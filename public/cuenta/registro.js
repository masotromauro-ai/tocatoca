/* ═══════════════════════════════════════════════════════════
   cuenta/registro.js — la lógica del registro, sin pantalla ni Firebase.
   Sello: registro-1 (7-nov-2026)

   registro.html es cableado: lo que se decide (si los datos sirven, qué paso
   sigue, qué dice un error, qué ficha se crea) vive acá y lo prueba
   pruebas/registro.mjs con node a secas.
   ═══════════════════════════════════════════════════════════ */
export const VERSION = "registro-2";

/** El mail de Firebase suele caer en SPAM (pasó con el de Mauro, 7-nov-2026):
    se dice a la vista cada vez que se manda uno. */
export const REMITENTE = "noreply@tocatoca-621a5.firebaseapp.com";
export const AVISO_SPAM = "Muchas veces llega a la carpeta de Spam o Correo no deseado: buscalo ahí, "
  + "de " + REMITENTE + ". Si está en Spam, marcalo como «No es spam» y tocá el enlace desde ahí.";

export const limpiarMail = (m) => String(m || "").trim().toLowerCase();

/** Lo que falta o está mal antes de crear la cuenta; "" si está todo bien. */
export function validar({ mail, clave, clave2, nombre }, nueva = true) {
  const m = limpiarMail(mail);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m)) return "Revisá el mail: no parece una dirección válida.";
  if (!clave) return "Falta la contraseña.";
  if (!nueva) return "";
  if (!String(nombre || "").trim()) return "Escribí tu nombre: es como te van a ver los demás.";
  if (String(clave).length < 8) return "La contraseña tiene que tener al menos 8 caracteres.";
  if (clave !== clave2) return "Las dos contraseñas no coinciden.";
  return "";
}

/** En qué paso está la persona. */
export function paso({ usuario, verificado, tieneFicha, invitacion }) {
  if (!usuario) return "entrar";
  if (tieneFicha) return "listo";
  if (!verificado) return "verificar";
  if (!invitacion) return "sin-invitacion";
  return "crear-ficha";
}

/** La ficha que crea la propia persona: exactamente lo que dejan las reglas. */
export function fichaNueva(mail, nombre, invitacion) {
  const f = { nombre: String(nombre || "").trim().slice(0, 60) || limpiarMail(mail).split("@")[0],
    mail: limpiarMail(mail), rol: invitacion.rol, activo: true, creado: Date.now() };
  if (invitacion.usuario) f.usuario = String(invitacion.usuario);
  return f;
}

const CAUSAS = {
  "auth/email-already-in-use": "Ese mail ya tiene cuenta: tocá «Ya tengo cuenta» y entrá con tu contraseña.",
  "auth/invalid-email": "Revisá el mail: no parece una dirección válida.",
  "auth/weak-password": "La contraseña es muy débil: usá al menos 8 caracteres.",
  "auth/invalid-credential": "Mail o contraseña incorrectos.",
  "auth/wrong-password": "Mail o contraseña incorrectos.",
  "auth/user-not-found": "No hay una cuenta con ese mail: creala primero.",
  "auth/too-many-requests": "Demasiados intentos. Esperá unos minutos y volvé a probar.",
  "auth/network-request-failed": "No hay conexión. Revisá internet y volvé a probar.",
  "permission-denied": "La base no dejó crear tu ficha: puede que tu mail no esté verificado o que no tengas invitación.",
};
export const causa = (e) => CAUSAS[(e && e.code) || ""] || ("Algo falló: " + ((e && (e.code || e.message)) || "sin detalle") + ".");
