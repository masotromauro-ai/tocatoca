/* ═══════════════════════════════════════════════════════════
   cuenta/firebase.js — el contacto con el SDK de Firebase del lado de public/.
   Sello: cuenta-init-1 (7-nov-2026)

   LA CONFIGURACIÓN NO ES UN SECRETO: identifica tocatoca-621a5 ante la API web
   y no da un solo permiso. Lo que da o niega acceso son las reglas
   (firestore.rules del repositorio).

   EL SDK SE CARGA DIFERIDO, con import() dentro de un try: un import estático
   deja la página en blanco si gstatic no contesta. Lo exportado son `let`
   (enlaces vivos) que valen undefined hasta que cargarFirebase() resuelve.
   ═══════════════════════════════════════════════════════════ */
export const VERSION = "cuenta-init-1";
const SDK = "https://www.gstatic.com/firebasejs/12.16.0/";

export const firebaseConfig = {
  apiKey: "AIzaSyDdBEPqcKk9815MS2CdOlaFHmJcEup2UFU",
  authDomain: "tocatoca-621a5.firebaseapp.com",
  projectId: "tocatoca-621a5",
  storageBucket: "tocatoca-621a5.firebasestorage.app",
  messagingSenderId: "1065784457914",
  appId: "1:1065784457914:web:4c1e999adbeeec494ce083"
};

export let auth, db, A, F;
let cargado = null;

export function cargarFirebase() {
  if (cargado) return cargado;
  cargado = (async () => {
    try {
      const [ap, au, fs] = await Promise.all([
        import(SDK + "firebase-app.js"),
        import(SDK + "firebase-auth.js"),
        import(SDK + "firebase-firestore.js"),
      ]);
      const app = ap.initializeApp(firebaseConfig);
      auth = au.getAuth(app);
      auth.languageCode = "es";
      db = fs.getFirestore(app);
      A = au; F = fs;
      return true;
    } catch (e) {
      console.warn("Firebase no bajó:", e);
      return false;
    }
  })();
  return cargado;
}
