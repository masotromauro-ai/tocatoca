// src/Puerta.jsx — la entrada a la app con la cuenta de BandoMaps (8-nov-2026).
// Cableado: lo que se decide está en public/cuenta/puerta.js (pruebas/puerta.mjs).
// El SDK de Firebase se pide a public/cuenta/firebase.js, el ÚNICO contacto con
// el SDK del proyecto: se importa en tiempo de ejecución (no lo empaqueta Vite),
// así la app y las páginas de public/ comparten una sola configuración y una
// sola sesión.
import { useEffect, useState } from "react";

const cargar = (ruta) => import(/* @vite-ignore */ ruta);
const G = { bg: "#0a0a0b", card: "#131315", line: "#2a2a2e", tx: "#ececec", mu: "#8a8a90", mal: "#e08a84", ok: "#2dd4bf" };
const ui = "Inter,system-ui,sans-serif";
const inp = { width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${G.line}`, background: "#0e0e10", color: G.tx, fontSize: 15, boxSizing: "border-box", margin: "4px 0 12px", fontFamily: ui };
const btn = (lleno) => ({ padding: "10px 14px", borderRadius: 10, border: `1px solid ${lleno ? G.tx : G.line}`, background: lleno ? G.tx : "transparent", color: lleno ? "#0a0a0b" : G.tx, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: ui });

function Caja({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: G.bg, fontFamily: ui }}>
      <div style={{ width: "100%", maxWidth: 380, background: G.card, border: `1px solid ${G.line}`, borderRadius: 16, padding: "26px 22px", color: G.tx }}>
        <h1 style={{ fontFamily: "'Libre Baskerville',Georgia,serif", fontSize: 22, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0, textAlign: "center" }}>BandoMaps</h1>
        <p style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: G.mu, textAlign: "center", margin: "6px 0 22px" }}>Bandoneón · Tango · Jazz</p>
        {children}
      </div>
    </div>
  );
}
const Nota = ({ children, color }) => <p style={{ fontSize: 13, color: color || G.mu, lineHeight: 1.5, margin: "12px 0 0" }}>{children}</p>;
const Enlace = ({ href, children }) => <a href={href} style={{ color: G.tx }}>{children}</a>;

export default function Puerta({ children }) {
  const [m, setM] = useState(null);            // los módulos: { fb, pu }
  const [est, setEst] = useState({ listo: false });
  const [mail, setMail] = useState("");
  const [clave, setClave] = useState("");
  const [msg, setMsg] = useState({ t: "", ok: false });
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    let vivo = true, desFicha = () => {}, desAuth = () => {};
    (async () => {
      let fb, pu;
      try { [fb, pu] = await Promise.all([cargar("/cuenta/firebase.js"), cargar("/cuenta/puerta.js")]); } catch (e) { fb = null; }
      const ok = !!fb && (await fb.cargarFirebase());
      if (!vivo) return;
      if (!ok) { setEst({ listo: true, firebase: false }); return; }
      setM({ fb, pu });
      import("https://maurogasta-crypto.github.io/datos/ojos.js").catch(() => {});
      desAuth = fb.A.onAuthStateChanged(fb.auth, (u) => {
        desFicha();
        if (!u) { setEst({ listo: true, firebase: true }); return; }
        setEst({ listo: false, firebase: true });
        // La ficha se ESCUCHA: si el admin suspende o cambia el rol, la app se entera sola.
        desFicha = fb.F.onSnapshot(fb.F.doc(fb.db, "usuarios", u.uid),
          (d) => setEst({ listo: true, firebase: true, usuario: u, verificado: u.emailVerified, ficha: d.exists() ? { id: u.uid, ...d.data() } : null }),
          (e) => { setEst({ listo: true, firebase: true, usuario: u, verificado: u.emailVerified, ficha: null }); setMsg({ t: pu.causa(e), ok: false }); });
      });
    })();
    return () => { vivo = false; desFicha(); desAuth(); };
  }, []);

  const fase = m ? m.pu.fase(est) : (est.listo ? "sin-firebase" : "cargando");
  const per = m && est.ficha ? m.pu.permisos(est.ficha) : null;

  // Lo que lee la app vieja: Mis tareas / Organizador y el nombre del alumno.
  if (fase === "app" && per) {
    window.__ALUMNO = per.alumno;
    window.__USUARIO = m.pu.usuarioDe(est.ficha);
    window.__ROL = per.rol;
  }

  const conEspera = async (f) => {
    if (ocupado) return; setOcupado(true); setMsg({ t: "", ok: false });
    try { await f(); } catch (e) { setMsg({ t: m.pu.causa(e), ok: false }); } finally { setOcupado(false); }
  };
  const entrar = (e) => { e.preventDefault(); conEspera(async () => {
    const ml = mail.trim().toLowerCase();
    if (!ml || !clave) { setMsg({ t: "Escribí tu mail y tu contraseña.", ok: false }); return; }
    await m.fb.A.signInWithEmailAndPassword(m.fb.auth, ml, clave); setClave("");
  }); };
  const olvide = () => conEspera(async () => {
    const ml = mail.trim().toLowerCase();
    if (!ml) { setMsg({ t: "Escribí tu mail arriba y volvé a tocar «Olvidé la contraseña».", ok: false }); return; }
    await m.fb.A.sendPasswordResetEmail(m.fb.auth, ml);
    setMsg({ t: "Listo: te mandamos un mail para elegir otra contraseña. Si no lo ves, buscalo en Spam.", ok: true });
  });
  const salir = () => { delete window.__ALUMNO; delete window.__USUARIO; delete window.__ROL; m && m.fb.A.signOut(m.fb.auth); };

  if (fase === "cargando") return <Caja><Nota>Cargando…</Nota></Caja>;
  if (fase === "sin-firebase") return <Caja><Nota color={G.mal}>No se pudo comprobar tu cuenta: revisá la conexión y recargá la página.</Nota></Caja>;

  if (fase === "entrar") return (
    <Caja>
      <form onSubmit={entrar}>
        <label style={{ fontSize: 12, color: G.mu }} htmlFor="pMail">Mail</label>
        <input id="pMail" style={inp} type="email" value={mail} onChange={(e) => setMail(e.target.value)} autoCapitalize="none" autoCorrect="off" autoComplete="email" />
        <label style={{ fontSize: 12, color: G.mu }} htmlFor="pClave">Contraseña</label>
        <input id="pClave" style={inp} type="password" value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="current-password" />
        <button id="pEntrar" type="submit" style={{ ...btn(true), width: "100%" }} disabled={ocupado}>{ocupado ? "Entrando…" : "Entrar"}</button>
        <button type="button" onClick={olvide} style={{ background: "none", border: "none", color: G.mu, fontSize: 13, textDecoration: "underline", cursor: "pointer", padding: "12px 0 0", fontFamily: ui }}>Olvidé la contraseña</button>
        {msg.t && <Nota color={msg.ok ? G.ok : G.mal}>{msg.t}</Nota>}
        <Nota>¿Primera vez? <Enlace href="/registro.html">Registrate con el mail de tu invitación</Enlace>. Sin invitación no se puede entrar: pedísela a tu profesor.</Nota>
      </form>
    </Caja>
  );

  if (fase === "verificar" || fase === "sin-ficha") return (
    <Caja>
      <Nota color={G.tx}>{fase === "verificar" ? "Te falta confirmar tu mail." : "Tu cuenta todavía no terminó el registro."}</Nota>
      <Nota>Seguí en la página de registro: ahí se confirma el mail y se crea tu acceso con el papel de tu invitación.</Nota>
      <p style={{ margin: "16px 0 0", display: "flex", gap: 8 }}>
        <a href="/registro.html" style={{ ...btn(true), textDecoration: "none", flex: 1, textAlign: "center" }}>Ir al registro</a>
        <button type="button" style={btn(false)} onClick={salir}>Salir</button>
      </p>
    </Caja>
  );

  if (fase === "suspendido") return (
    <Caja>
      <Nota color={G.mal}>Tu cuenta está suspendida.</Nota>
      <Nota>Si creés que es un error, hablalo con tu profesor o con la administración.</Nota>
      <p style={{ margin: "16px 0 0" }}><button type="button" style={btn(false)} onClick={salir}>Salir</button></p>
    </Caja>
  );

  return (
    <>
      {children}
      <div style={{ position: "fixed", right: 10, bottom: "calc(10px + env(safe-area-inset-bottom,0px))", zIndex: 60, display: "flex", gap: 6, fontFamily: ui }}>
        {per.usuarios && <a href="/usuarios.html" style={{ ...btn(false), padding: "7px 12px", fontSize: 12, background: "#131315", textDecoration: "none", boxShadow: "0 4px 16px rgba(0,0,0,.6)" }}>👥 Usuarios</a>}
        <button type="button" onClick={salir} style={{ ...btn(false), padding: "7px 12px", fontSize: 12, background: "#131315", boxShadow: "0 4px 16px rgba(0,0,0,.6)" }}>Salir ({est.ficha.nombre || est.ficha.mail})</button>
      </div>
    </>
  );
}
