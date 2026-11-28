// La pestaña Ejecución: el instrumento virtual en pantalla completa, para tocar.
// Dos formas: «Piano» (teclados horizontales, manos rectas) y «Real» (teclados verticales,
// el izquierdo a la izquierda y el derecho a la derecha). Se toca de a una mano por vez
// (también está «Ambas»). Con «Tamaño real» cada botón mide lo mismo que en el instrumento (pantalla calibrada con regla),
// y con «Alinear» se acomoda el teclado dibujado debajo del teclado físico de silicona puesto sobre la pantalla.

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { LAT } from "../../shared/teoria/notas.js";
import { UI_FONT } from "../../shared/ui/tema.js";
import { BTN_SIZE } from "../../shared/bandoneon/layouts.js";
import { loadBtns } from "../../shared/bandoneon/almacen.js";
import { useSonidoEjecucion, PRESION_INICIAL } from "./sonidoEjecucion.js";
import { U, GAP, CERO, geometria, conMedidas, colocar, clavePos, estirar, extension, ajusteTeclado, ESQUINAS, CONTORNO } from "./ejecucionGeometria.js";
import { Tecla, Disco, Contorno, Opciones, FranjaFuelle, PanelAlinear } from "./EjecucionPiezas.jsx";

const MAX_ESCALA = 3.2;  // tope al ajustar a la pantalla
const CLAVE = "bandomaps_ejecucion";   // ajustes de esta pestaña en el aparato (clave nueva)
const EXTRA_MM = 2;      // cada botón se agranda esta cantidad de milímetros de diámetro (más zona de toque)
const MARGEN_U = 4;      // aire mínimo, en unidades del dibujo, que queda entre dos botones vecinos aunque se agranden
const RESTA_MM = 1;      // a las teclas dibujadas se les quita 1 mm de diámetro
const r2 = (v) => Math.round(v * 100) / 100;
const r4 = (v) => Math.round(v * 10000) / 10000;
const limita = (v, a, b) => Math.max(a, Math.min(b, v));
const cm = (v) => v.toFixed(1).replace(".", ",");

// Píxeles CSS por centímetro antes de calibrar: un cálculo según el aparato (iPad 264 ppi, iPhone 14 460 ppi), que la regla corrige
function pxcmBase() {
  try {
    const ua = navigator.userAgent || "", tactil = (navigator.maxTouchPoints || 0) > 1;
    if (/iPad/.test(ua) || (/Macintosh/.test(ua) && tactil)) return 52.0;
    if (/iPhone/.test(ua)) return 60.4;
  } catch (e) {}
  return 96 / 2.54;
}

function leerPos(o) {
  const r = {};
  if (o && typeof o === "object") for (const k of Object.keys(o)) {
    const v = o[k];
    if (v && Number.isFinite(v.dx) && Number.isFinite(v.dy) && Number.isFinite(v.rot))
      r[k] = { dx: limita(v.dx, -300, 300), dy: limita(v.dy, -300, 300), rot: limita(v.rot, -180, 180),
               sx: Number.isFinite(v.sx) ? limita(v.sx, 0.5, 2) : 1, sy: Number.isFinite(v.sy) ? limita(v.sy, 0.5, 2) : 1 };
  }
  return r;
}

function leerAjustes() {
  try {
    const a = JSON.parse(localStorage.getItem(CLAVE) || "{}");
    return {
      forma: a.forma === "real" ? "real" : "piano",
      mano: ["izq", "der", "ambas"].includes(a.mano) ? a.mano : "der",
      ajuste: a.ajuste !== false,
      real: a.real === true,
      escala: Number.isFinite(a.escala) ? Math.min(4, Math.max(0.3, a.escala)) : 1,
      pxcm: Number.isFinite(a.pxcm) ? Math.min(80, Math.max(20, a.pxcm)) : pxcmBase(),
      presion: Number.isFinite(a.presion) ? Math.min(1, Math.max(0, a.presion)) : PRESION_INICIAL,
      pos: leerPos(a.pos),
    };
  } catch (e) { return { forma: "piano", mano: "der", ajuste: true, real: false, escala: 1, pxcm: pxcmBase(), presion: PRESION_INICIAL, pos: {} }; }
}

export function EjecucionTab({ onSalir }) {
  const inicial = useMemo(leerAjustes, []);
  const datos = useMemo(() => { const d = loadBtns(); return { izq: conMedidas(d.left, "izq"), der: conMedidas(d.right, "der") }; }, []);
  const [forma, setForma] = useState(inicial.forma);
  const [mano, setMano] = useState(inicial.mano);
  const [ajuste, setAjuste] = useState(inicial.ajuste);
  const [real, setReal] = useState(inicial.real);   // tamaño real: 1 mm del instrumento = 1 mm de pantalla (con la pantalla calibrada)
  const [escala, setEscala] = useState(inicial.escala);
  const [pxcm, setPxcm] = useState(inicial.pxcm);
  const [presion, setPresion] = useState(inicial.presion);
  const [pos, setPos] = useState(inicial.pos);        // dónde quedó cada teclado: {"real-der": {dx, dy, rot}} en mm y grados
  const [fuelle, setFuelle] = useState("abre");
  const [panel, setPanel] = useState(false);
  const [alinear, setAlinear] = useState(false);
  const [sel, setSel] = useState("der");              // con «Ambas»: cuál teclado se mueve
  const [paso, setPaso] = useState(1);
  const [ladoPanel, setLadoPanel] = useState("right");
  const [calib, setCalib] = useState(false);
  const [toques, setToques] = useState([]);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [avisoFS, setAvisoFS] = useState(false);
  const [pulsadas, setPulsadas] = useState([]);
  const [area, setArea] = useState({ w: 0, h: 0 });
  const [vista, setVista] = useState({ w: typeof window === "undefined" ? 1024 : window.innerWidth, h: typeof window === "undefined" ? 768 : window.innerHeight });
  const [barraH, setBarraH] = useState(58);        // alto de la barra de arriba (en pantallas angostas ocupa dos filas): los paneles se ponen debajo
  const [orientBloq, setOrientBloq] = useState(null);   // orientación del aparato al entrar al tamaño real: si cambia, se avisa
  const raizRef = useRef(null), barraRef = useRef(null), escenaRef = useRef(null), arrastre = useRef(null);
  const { startNote, stopNote, stopAllNotes, setPresion: aplicarPresion } = useSonidoEjecucion({ bellows: fuelle });
  useEffect(() => { aplicarPresion(presion); }, [presion, aplicarPresion]);

  // Guarda los ajustes de la pestaña
  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify({ forma, mano, ajuste, real, escala, pxcm, presion, pos })); } catch (e) {}
  }, [forma, mano, ajuste, real, escala, pxcm, presion, pos]);

  // Mide la zona libre para el teclado y la pantalla entera (el teclado a tamaño real se centra en la pantalla)
  useEffect(() => {
    const medir = () => {
      const el = escenaRef.current, rz = raizRef.current;
      if (el) setArea({ w: el.clientWidth, h: el.clientHeight });
      if (rz) setVista({ w: rz.clientWidth, h: rz.clientHeight });
      if (barraRef.current) setBarraH(barraRef.current.offsetHeight);
    };
    medir();
    let ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(medir); [escenaRef.current, raizRef.current, barraRef.current].forEach(el => el && ro.observe(el)); }
    window.addEventListener("resize", medir);
    return () => { if (ro) ro.disconnect(); window.removeEventListener("resize", medir); };
  }, []);

  // La pantalla no se mueve mientras se toca; al salir se suelta todo
  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const soltar = () => { stopAllNotes(); setPulsadas([]); };
    window.addEventListener("blur", soltar);
    document.addEventListener("visibilitychange", soltar);
    const fs = () => setPantallaCompleta(!!(document.fullscreenElement || document.webkitFullscreenElement));
    document.addEventListener("fullscreenchange", fs);
    document.addEventListener("webkitfullscreenchange", fs);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener("blur", soltar);
      document.removeEventListener("visibilitychange", soltar);
      document.removeEventListener("fullscreenchange", fs);
      document.removeEventListener("webkitfullscreenchange", fs);
      try { if (document.fullscreenElement) document.exitFullscreen(); else if (document.webkitFullscreenElement) document.webkitExitFullscreen(); } catch (e) {}
    };
  }, [stopAllNotes]);

  // Cambiar fuelle, mano, forma o entrar a alinear corta lo que esté sonando; los toques anotados ya no valen si el teclado se movió
  useEffect(() => { stopAllNotes(); setPulsadas([]); }, [fuelle, mano, forma, alinear, stopAllNotes]);
  useEffect(() => { setToques([]); }, [pos, sel, mano, forma, pxcm, alinear, pantallaCompleta]);
  useEffect(() => { if (!avisoFS) return; const t = setTimeout(() => setAvisoFS(false), 9000); return () => clearTimeout(t); }, [avisoFS]);

  const abajo = useCallback((b, lat, oct, e) => {
    if (alinear) {   // alineando no suena: solo se enciende y, si se piden toques, se anota dónde tocó el dedo respecto del centro dibujado
      if (calib && e) {
        const r = e.currentTarget.getBoundingClientRect();
        const par = { id: b.id, v: { x: r.left + r.width / 2, y: r.top + r.height / 2 }, t: { x: e.clientX, y: e.clientY } };
        setToques(a => [...a.filter(q => q.id !== b.id), par]);
      }
    } else startNote(b.id, LAT[lat] || lat, oct);
    setPulsadas(p => p.includes(b.id) ? p : [...p, b.id]);
  }, [alinear, calib, startNote]);
  const arriba = useCallback((id) => {
    stopNote(id);
    setPulsadas(p => p.includes(id) ? p.filter(x => x !== id) : p);
  }, [stopNote]);

  // Pantalla completa: el botón está siempre; si el navegador no la permite (pasa en algunos iPad y en iPhone) se explica cómo verla sin barras
  const puedeFS = typeof document !== "undefined" && !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  const alternarPantallaCompleta = () => {
    if (!puedeFS) { setAvisoFS(true); return; }
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else { const el = document.documentElement; (el.requestFullscreen || el.webkitRequestFullscreen).call(el); }
    } catch (e) { setAvisoFS(true); }
  };
  const suf = pantallaCompleta ? "fs" : "nf";   // la alineación se guarda por separado con y sin pantalla completa: la pantalla útil cambia de lugar

  // Teclados a mostrar y escala
  const enReal = real || alinear;   // alinear siempre va a tamaño real. Estando a tamaño real el teclado queda BLOQUEADO: solo se sale con «Salir del tamaño real»
  const orient = vista.w >= vista.h ? "h" : "v";
  const girado = enReal && orientBloq && orientBloq !== orient;   // el aparato se giró: el teclado físico ya no coincide
  useEffect(() => { setOrientBloq(enReal ? (vista.w >= vista.h ? "h" : "v") : null); }, [enReal]);   // eslint-disable-line react-hooks/exhaustive-deps
  // Bloqueado no se hace zoom con los dedos ni se desplaza la pantalla
  useEffect(() => {
    if (!enReal) return;
    const frena = (e) => e.preventDefault();
    const multi = (e) => { if (e.touches && e.touches.length > 1) e.preventDefault(); };
    const gestos = ["gesturestart", "gesturechange", "gestureend"];
    gestos.forEach(g => document.addEventListener(g, frena, { passive: false }));
    document.addEventListener("touchmove", multi, { passive: false });
    return () => { gestos.forEach(g => document.removeEventListener(g, frena)); document.removeEventListener("touchmove", multi); };
  }, [enReal]);
  const salirTamanoReal = () => { setReal(false); setAlinear(false); setCalib(false); setPanel(false); };
  const manos = mano === "ambas" ? ["izq", "der"] : [mano];
  const G = useMemo(() => manos.map(m => geometria(datos[m], forma, m)), [mano, forma, datos]);   // eslint-disable-line react-hooks/exhaustive-deps
  const TW = G.reduce((s, g) => s + g.W, 0) + GAP * (G.length - 1);
  const TH = Math.max(...G.map(g => g.H));
  const ajustada = Math.min(Math.max(60, area.w - 24) / TW, Math.max(60, area.h - 24) / TH, MAX_ESCALA);
  const kReal = pxcm / 10 / U;   // escala a la que el teclado mide lo mismo que el instrumento
  const refCm = pxcm * 10 <= Math.min(520, vista.w - 60) ? 10 : 5;   // barra de referencia para la regla: 10 cm si entra en el panel, si no 5 cm
  const k = enReal ? kReal : ajuste ? ajustada : escala;
  const mmU = pxcm / 10 / k;   // unidades del dibujo que ocupa 1 mm en pantalla
  const extraMax = Math.max(0, Math.min(...G.map(g => g.sep)) - BTN_SIZE - MARGEN_U);   // que ni agrandados se toquen dos botones
  const extra = Math.max(0, Math.min(extraMax, EXTRA_MM * mmU) - RESTA_MM * mmU);   // +2 mm de diámetro (con tope) y −1 mm

  // A tamaño real los teclados se colocan respecto de la pantalla, con el corrimiento, el giro y el estirado guardados
  const colocados = useMemo(() => enReal ? colocar(G, manos, forma, kReal, vista, pos, pxcm, suf) : [], [enReal, G, forma, kReal, vista, pos, pxcm, suf]);   // eslint-disable-line react-hooks/exhaustive-deps
  const Gm = enReal ? colocados.map(c => c.g) : G;   // geometrías tal como se ven (ya estiradas)
  const selMano = mano === "ambas" ? sel : mano;
  const clave = clavePos(forma, selMano, suf), p = pos[clave] || CERO;
  const cc = colocados.find(c => c.mano === selMano);
  const px = pxcm / 10;
  const toquesSel = toques.filter(q => q.id.startsWith(selMano === "izq" ? "L" : "R"));
  const est = cc && { cx: cc.cx, cy: cc.cy, rot: p.rot, sx: p.sx, sy: p.sy };
  const raw = alinear && cc && toquesSel.length ? ajusteTeclado(toquesSel, est) : null;
  const res = raw && { ...raw, dxmm: (raw.cx - cc.cx) / px, dymm: (raw.cy - cc.cy) / px, giro: raw.rot - p.rot };
  const ext = cc ? extension(cc.g) : { w: 0, h: 0 };

  const mueve = (dx, dy, dr) => setPos(a => { const q = a[clave] || CERO; return { ...a, [clave]: { ...q, dx: r2(q.dx + dx), dy: r2(q.dy + dy), rot: r2(q.rot + dr) } }; });
  const estira = (dw, dh) => setPos(a => {   // cambia el ancho o el alto del teclado en mm (entre los centros de las teclas más separadas)
    const q = a[clave] || CERO, e = extension(estirar(G[manos.indexOf(selMano)], q.sx, q.sy));
    return { ...a, [clave]: { ...q, sx: e.w > 0 ? r4(limita(q.sx * (e.w + dw) / e.w, 0.5, 2)) : q.sx, sy: e.h > 0 ? r4(limita(q.sy * (e.h + dh) / e.h, 0.5, 2)) : q.sy } };
  });
  const aplicar = () => {   // aplica lo calculado con los toques: corrimiento, giro y estirado de ancho y alto
    if (!cc || !toquesSel.length) return;
    const r = ajusteTeclado(toquesSel, est);
    const nuevo = { ...pos, [clave]: { dx: 0, dy: 0, rot: r2(r.rot), sx: r4(limita(r.sx, 0.5, 2)), sy: r4(limita(r.sy, 0.5, 2)) } };
    const base = colocar(G, manos, forma, kReal, vista, nuevo, pxcm, suf).find(c => c.mano === selMano);   // el estirado cambia el centro de partida
    nuevo[clave].dx = r2((r.cx - base.bx) / px); nuevo[clave].dy = r2((r.cy - base.by) / px);
    setPos(nuevo); setToques([]);
  };
  // Arrastrar un dedo por la zona libre mueve el teclado dibujado (como un panel táctil)
  const empezarArrastre = (e) => { if (!alinear) return; e.currentTarget.setPointerCapture(e.pointerId); arrastre.current = { id: e.pointerId, x: e.clientX, y: e.clientY }; };
  const seguirArrastre = (e) => {
    const a = arrastre.current; if (!a || a.id !== e.pointerId) return;
    mueve((e.clientX - a.x) / (pxcm / 10), (e.clientY - a.y) / (pxcm / 10), 0); a.x = e.clientX; a.y = e.clientY;
  };
  const terminarArrastre = () => { arrastre.current = null; };

  const boton = { fontFamily: UI_FONT, fontSize: 14, fontWeight: 600, minHeight: 40, padding: "0 14px", borderRadius: 10, cursor: "pointer", background: "#121214", border: "1px solid #2a2a2e", color: "#d6d6da" };
  const activo = (on) => ({ ...boton, background: on ? "#ececec" : "#121214", color: on ? "#101012" : "#d6d6da" });
  const etq = { fontFamily: UI_FONT, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7c7c82", fontWeight: 600 };

  return (
    <div ref={raizRef} style={{ position: "fixed", inset: 0, zIndex: 2147483000, display: "flex", flexDirection: "column", background: "linear-gradient(160deg,#09090a 0%,#0f0f10 55%,#111113 100%)", color: "#ececec", fontFamily: UI_FONT }}>
      {/* Barra. Normal: salir, forma, mano, fuelle. Bloqueada (tamaño real): solo lo necesario, para que nada se mueva ni se dé vuelta sin querer */}
      <div ref={barraRef} style={{ position: "relative", zIndex: 3, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: "1px solid #1f1f22", background: "rgba(10,10,11,.94)", flexShrink: 0 }}>
        {enReal ? (
          <>
            <button onClick={salirTamanoReal} style={{ ...boton, background: "#ececec", color: "#101012" }} aria-label="Salir del tamaño real">✕ Salir del tamaño real</button>
            <span style={{ ...etq, letterSpacing: "0.08em" }} aria-label="Teclado bloqueado">🔒 {forma === "real" ? "Real" : "Piano"} · {mano === "izq" ? "Izquierda" : mano === "der" ? "Derecha" : "Ambas"}</span>
            <Opciones etiqueta="Fuelle" valor={fuelle} onCambia={setFuelle} opciones={[["abre", "Abre"], ["cierra", "Cierra"]]} />
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={() => { setAlinear(a => !a); setCalib(false); }} style={activo(alinear)} aria-pressed={alinear}>◎ Alinear</button>
              <button onClick={() => setPanel(v => !v)} style={activo(panel)} aria-expanded={panel}>⚙ Calibrar</button>
              <button onClick={alternarPantallaCompleta} style={boton} aria-label="Pantalla completa del navegador">{pantallaCompleta ? "⤢ Achicar" : "⛶ Pantalla completa"}</button>
            </div>
          </>
        ) : (
          <>
            <button onClick={onSalir} style={boton} aria-label="Salir de la ejecución">✕ Salir</button>
            <Opciones etiqueta="Forma del teclado" valor={forma} onCambia={setForma} opciones={[["piano", "Piano"], ["real", "Real"]]} />
            <Opciones etiqueta="Mano" valor={mano} onCambia={setMano} opciones={[["izq", "Izquierda"], ["der", "Derecha"], ["ambas", "Ambas"]]} />
            <Opciones etiqueta="Fuelle" valor={fuelle} onCambia={setFuelle} opciones={[["abre", "Abre"], ["cierra", "Cierra"]]} />
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <button onClick={() => { setAlinear(a => !a); setCalib(false); }} style={activo(alinear)} aria-pressed={alinear}>◎ Alinear</button>
              <button onClick={() => setPanel(v => !v)} style={activo(panel)} aria-expanded={panel}>⚙ Tamaño</button>
              <button onClick={alternarPantallaCompleta} style={boton} aria-label="Pantalla completa del navegador">{pantallaCompleta ? "⤢ Achicar" : "⛶ Pantalla completa"}</button>
            </div>
          </>
        )}
      </div>

      {avisoFS && (
        <div role="status" style={{ position: "absolute", top: barraH + 8, left: 12, right: 12, zIndex: 7, background: "#17171a", border: "1px solid #2f2f34", borderRadius: 12, padding: "10px 14px", fontSize: 13.5, lineHeight: 1.45, color: "#e4e4e8" }}>
          Este navegador no permite pantalla completa. Para verla sin barras: en Safari tocá Compartir y «Agregar a inicio», y abrí BandoMaps desde ese ícono.
          <button onClick={() => setAvisoFS(false)} style={{ ...boton, minHeight: 32, marginLeft: 10 }} aria-label="Cerrar el aviso">✕</button>
        </div>
      )}

      {/* Panel de tamaño y calibración */}
      {panel && (
        <div style={{ position: "absolute", top: barraH + 8, right: 12, zIndex: 5, boxSizing: "border-box", width: 560, maxWidth: "calc(100vw - 24px)", maxHeight: `calc(100% - ${barraH + 20}px)`, overflowY: "auto", touchAction: "pan-y",
          background: "#101012", border: "1px solid #2a2a2e", borderRadius: 14, padding: 14, boxShadow: "0 18px 40px rgba(0,0,0,.7)", display: "grid", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <p style={{ ...etq, flex: 1 }}>{enReal ? "Calibrar la pantalla" : "Tamaño del teclado"}</p>
            <button onClick={() => setPanel(false)} style={{ ...boton, minHeight: 36, minWidth: 36, padding: 0 }} aria-label="Cerrar">✕</button>
          </div>
          {!enReal && <div>
            <div style={{ marginTop: 0 }}>
              <Opciones etiqueta="Tamaño" valor={real ? "real" : ajuste ? "ajuste" : "fija"}
                onCambia={v => { if (v === "fija") setEscala(Math.round(k * 20) / 20); setReal(v === "real"); setAjuste(v === "ajuste"); if (v === "real") setPanel(false); }}
                opciones={[["ajuste", "Ajustar"], ["real", "Tamaño real"], ["fija", "Medida fija"]]} />
            </div>
            {!ajuste && (
              <label style={{ display: "block", marginTop: 10, fontSize: 13, color: "#c8c8cc" }}>
                Escala: {Math.round(escala * 100)} %
                <input type="range" min="0.3" max="4" step="0.05" value={escala} onChange={e => setEscala(parseFloat(e.target.value))} style={{ width: "100%", height: 36 }} />
              </label>
            )}
          </div>}
          <div>
            <p style={etq}>Lo que mide ahora</p>
            <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6, color: "#d6d6da" }}>
              {manos.map((m, i) => (
                <div key={m}>{m === "izq" ? "Izquierdo" : "Derecho"}: {cm(Gm[i].W * k / pxcm)} × {cm(Gm[i].H * k / pxcm)} cm</div>
              ))}
              <div>Cada botón: {cm((BTN_SIZE + extra) * k / pxcm * 10)} mm de diámetro</div>
            </div>
          </div>
          <div>
            {!enReal && <p style={etq}>Calibrar la pantalla</p>}
            <p style={{ fontSize: 12.5, color: "#9a9aa0", margin: "6px 0 8px" }}>Apoyá una regla sobre la barra y movela hasta que mida justo {refCm} cm. Con el zoom del navegador al 100 %. El valor de partida es una estimación según el aparato.</p>
            <div style={{ width: pxcm * refCm, height: 14, borderRadius: 3, background: "#ececec", position: "relative" }}>
              {[0, refCm / 2, refCm].map(c => <span key={c} style={{ position: "absolute", left: c === refCm ? "auto" : `${c / refCm * 100}%`, right: c === refCm ? 0 : "auto", top: 14, fontSize: 10, color: "#9a9aa0" }}>{c} cm</span>)}
            </div>
            <input type="range" min="20" max="80" step="0.1" value={pxcm} onChange={e => setPxcm(parseFloat(e.target.value))} style={{ width: "100%", height: 36, marginTop: 22 }} />
            <button onClick={() => setPxcm(pxcmBase())} style={{ ...boton, minHeight: 34, fontSize: 12.5 }}>Volver al valor estimado</button>
          </div>
        </div>
      )}

      {alinear && (
        <PanelAlinear lado={ladoPanel} onLado={() => setLadoPanel(l => l === "right" ? "left" : "right")} p={p} mueve={mueve} centrar={() => setPos(a => ({ ...a, [clave]: { ...(a[clave] || CERO), dx: 0, dy: 0, rot: 0 } }))}
          paso={paso} onPaso={setPaso} sel={sel} onSel={setSel} hayAmbas={mano === "ambas"} calib={calib} onCalib={() => { setCalib(c => !c); setToques([]); }}
          nToques={toquesSel.length} res={res} onAplicar={aplicar} onBorrar={() => setToques([])}
          onCerrar={() => { setAlinear(false); setCalib(false); }} abrirTamano={() => setPanel(true)}
          ext={ext} estira={estira} quitarEstirado={() => setPos(a => ({ ...a, [clave]: { ...(a[clave] || CERO), sx: 1, sy: 1 } }))} modoFS={pantallaCompleta} />
      )}

      {/* Escena. La franja de presión va del lado de la mano libre: a la izquierda (o con ambas), a la derecha si se toca con la izquierda */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: mano === "izq" ? "row-reverse" : "row" }}>
        {!alinear && <FranjaFuelle valor={presion} onCambia={setPresion} />}   {/* al alinear no hace falta y deja libre el costado */}
        <div ref={escenaRef} onPointerDown={empezarArrastre} onPointerMove={seguirArrastre} onPointerUp={terminarArrastre} onPointerCancel={terminarArrastre}
          style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", overflow: (ajuste || enReal) ? "hidden" : "auto", touchAction: ajuste || enReal ? "none" : "pan-x pan-y" }}>
          {!enReal && (
            <div style={{ margin: "auto", display: "flex", gap: GAP * k, padding: 12, alignItems: "center" }}>
              {G.map((g, i) => (
                <div key={manos[i]} style={{ width: Math.ceil(g.W * k), height: Math.ceil(g.H * k), flexShrink: 0 }}>
                  <div style={{ position: "relative", width: g.W, height: g.H, transform: `scale(${k})`, transformOrigin: "top left",
                    background: "linear-gradient(145deg,#1d1d1d,#101010)", borderRadius: 16, boxShadow: "0 14px 22px -10px rgba(0,0,0,.95)", touchAction: "none" }}>
                    {g.items.map(it => <Tecla key={it.b.id} it={it} fuelle={fuelle} activa={pulsadas.includes(it.b.id)} abajo={abajo} arriba={arriba} extra={extra} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Si se giró el aparato estando bloqueado, el teclado físico ya no coincide: se avisa y no se toca nada hasta volver */}
      {girado && (
        <div role="alertdialog" aria-label="El aparato se giró" style={{ position: "absolute", inset: 0, zIndex: 20, background: "#09090a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: 24, textAlign: "center" }}>
          <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>El aparato se giró</p>
          <p style={{ fontSize: 15, color: "#b8b8be", margin: 0, maxWidth: 420, lineHeight: 1.5 }}>El teclado alineado quedó para el aparato en {orientBloq === "v" ? "vertical" : "horizontal"}. Volvé a ponerlo así para seguir, o salí del tamaño real.</p>
          <button onClick={salirTamanoReal} style={{ ...boton, background: "#ececec", color: "#101012" }}>✕ Salir del tamaño real</button>
        </div>
      )}

      {/* A tamaño real: capa sobre toda la pantalla, centrada en ella; solo las teclas reciben toques */}
      {enReal && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
          {colocados.map((c, i) => (
            <div key={c.mano} style={{ position: "absolute", left: c.left, top: c.top, width: c.w, height: c.h, transformOrigin: "50% 50%", pointerEvents: "none",
              transform: `translate(${c.tx}px, ${c.ty}px) rotate(${c.rot}deg)` }}>
              <div style={{ position: "relative", width: c.g.W, height: c.g.H, transform: `scale(${kReal})`, transformOrigin: "top left", borderRadius: 16, pointerEvents: "none",
                background: alinear ? "rgba(255,255,255,.04)" : "linear-gradient(145deg,#1d1d1d,#101010)", boxShadow: alinear ? "none" : "0 14px 22px -10px rgba(0,0,0,.95)" }}>
                {alinear && <Contorno g={c.g} ids={CONTORNO[c.mano]} />}
                {c.g.items.map(it => alinear
                  ? <Disco key={it.b.id} it={it} activa={pulsadas.includes(it.b.id)} abajo={abajo} arriba={arriba} esquina={ESQUINAS[c.mano].includes(it.b.id)} />
                  : <Tecla key={it.b.id} it={it} fuelle={fuelle} activa={pulsadas.includes(it.b.id)} abajo={abajo} arriba={arriba} extra={extra} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
