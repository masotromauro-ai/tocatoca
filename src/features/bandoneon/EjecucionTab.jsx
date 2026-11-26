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
import { U, GAP, geometria, conMedidas, colocar, ajusteDesdeToques, ESQUINAS } from "./ejecucionGeometria.js";
import { Tecla, Disco, Opciones, FranjaFuelle, PanelAlinear } from "./EjecucionPiezas.jsx";

const MAX_ESCALA = 3.2;  // tope al ajustar a la pantalla
const CLAVE = "bandomaps_ejecucion";   // ajustes de esta pestaña en el aparato (clave nueva)
const EXTRA_MM = 2;      // cada botón se agranda esta cantidad de milímetros de diámetro (más zona de toque)
const MARGEN_U = 4;      // aire mínimo, en unidades del dibujo, que queda entre dos botones vecinos aunque se agranden
const CERO = { dx: 0, dy: 0, rot: 0 };
const r2 = (v) => Math.round(v * 100) / 100;
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
      r[k] = { dx: Math.max(-300, Math.min(300, v.dx)), dy: Math.max(-300, Math.min(300, v.dy)), rot: Math.max(-180, Math.min(180, v.rot)) };
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
  const [pulsadas, setPulsadas] = useState([]);
  const [area, setArea] = useState({ w: 0, h: 0 });
  const [vista, setVista] = useState({ w: typeof window === "undefined" ? 1024 : window.innerWidth, h: typeof window === "undefined" ? 768 : window.innerHeight });
  const raizRef = useRef(null), escenaRef = useRef(null), arrastre = useRef(null);
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
    };
    medir();
    let ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(medir); [escenaRef.current, raizRef.current].forEach(el => el && ro.observe(el)); }
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
    const fs = () => setPantallaCompleta(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", fs);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener("blur", soltar);
      document.removeEventListener("visibilitychange", soltar);
      document.removeEventListener("fullscreenchange", fs);
      try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
    };
  }, [stopAllNotes]);

  // Cambiar fuelle, mano, forma o entrar a alinear corta lo que esté sonando; los toques anotados ya no valen si el teclado se movió
  useEffect(() => { stopAllNotes(); setPulsadas([]); }, [fuelle, mano, forma, alinear, stopAllNotes]);
  useEffect(() => { setToques([]); }, [pos, sel, mano, forma, pxcm, alinear]);

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

  const alternarPantallaCompleta = () => {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else document.documentElement.requestFullscreen();
    } catch (e) {}
  };
  const puedeFS = typeof document !== "undefined" && !!document.fullscreenEnabled;

  // Teclados a mostrar y escala
  const enReal = real || alinear;   // alinear siempre va a tamaño real
  const manos = mano === "ambas" ? ["izq", "der"] : [mano];
  const G = useMemo(() => manos.map(m => geometria(datos[m], forma, m)), [mano, forma, datos]);   // eslint-disable-line react-hooks/exhaustive-deps
  const TW = G.reduce((s, g) => s + g.W, 0) + GAP * (G.length - 1);
  const TH = Math.max(...G.map(g => g.H));
  const ajustada = Math.min(Math.max(60, area.w - 24) / TW, Math.max(60, area.h - 24) / TH, MAX_ESCALA);
  const kReal = pxcm / 10 / U;   // escala a la que el teclado mide lo mismo que el instrumento
  const k = enReal ? kReal : ajuste ? ajustada : escala;
  const extraMax = Math.max(0, Math.min(...G.map(g => g.sep)) - BTN_SIZE - MARGEN_U);   // que ni agrandados se toquen dos botones
  const extra = Math.min(extraMax, EXTRA_MM / 10 * pxcm / k);   // 2 mm de diámetro, medidos en unidades del dibujo

  // A tamaño real los teclados se colocan respecto de la pantalla, con el corrimiento y el giro guardados
  const colocados = useMemo(() => enReal ? colocar(G, manos, forma, kReal, vista, pos, pxcm) : [], [enReal, G, forma, kReal, vista, pos, pxcm]);   // eslint-disable-line react-hooks/exhaustive-deps
  const selMano = mano === "ambas" ? sel : mano;
  const clave = forma + "-" + selMano, p = pos[clave] || CERO;
  const cc = colocados.find(c => c.mano === selMano);
  const toquesSel = toques.filter(q => q.id.startsWith(selMano === "izq" ? "L" : "R"));
  const raw = alinear && cc && toquesSel.length ? ajusteDesdeToques(toquesSel, { x: cc.cx, y: cc.cy }) : null;
  const res = raw && { ...raw, dxmm: raw.ddx / (pxcm / 10), dymm: raw.ddy / (pxcm / 10) };

  const mueve = (dx, dy, dr) => setPos(a => { const q = a[clave] || CERO; return { ...a, [clave]: { dx: r2(q.dx + dx), dy: r2(q.dy + dy), rot: r2(q.rot + dr) } }; });
  const aplicar = (conTam) => {
    if (!cc || !toquesSel.length) return;
    const r = ajusteDesdeToques(toquesSel, { x: cc.cx, y: cc.cy }, conTam);
    const nuevo = Math.min(80, Math.max(20, conTam ? pxcm * r.escala : pxcm)), px0 = pxcm / 10, px1 = nuevo / 10;
    setPos(a => { const q = a[clave] || CERO; return { ...a, [clave]: { dx: r2((q.dx * px0 + r.ddx) / px1), dy: r2((q.dy * px0 + r.ddy) / px1), rot: r2(q.rot + r.giro) } }; });
    if (conTam) setPxcm(nuevo);
    setToques([]);
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
    <div ref={raizRef} style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", flexDirection: "column", background: "linear-gradient(160deg,#09090a 0%,#0f0f10 55%,#111113 100%)", color: "#ececec", fontFamily: UI_FONT }}>
      {/* Barra: salir, las dos opciones del teclado, mano, fuelle */}
      <div style={{ position: "relative", zIndex: 3, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: "1px solid #1f1f22", background: "rgba(10,10,11,.94)", flexShrink: 0 }}>
        <button onClick={onSalir} style={boton} aria-label="Salir de la ejecución">✕ Salir</button>
        <Opciones etiqueta="Forma del teclado" valor={forma} onCambia={setForma} opciones={[["piano", "Piano"], ["real", "Real"]]} />
        <Opciones etiqueta="Mano" valor={mano} onCambia={setMano} opciones={[["izq", "Izquierda"], ["der", "Derecha"], ["ambas", "Ambas"]]} />
        <Opciones etiqueta="Fuelle" valor={fuelle} onCambia={setFuelle} opciones={[["abre", "Abre"], ["cierra", "Cierra"]]} />
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => { setAlinear(a => !a); setCalib(false); }} style={activo(alinear)} aria-pressed={alinear}>◎ Alinear</button>
          <button onClick={() => setPanel(v => !v)} style={activo(panel)} aria-expanded={panel}>⚙ Tamaño</button>
          {puedeFS && <button onClick={alternarPantallaCompleta} style={boton} aria-label="Pantalla completa del navegador">{pantallaCompleta ? "⤢ Achicar" : "⛶ Pantalla completa"}</button>}
        </div>
      </div>

      {/* Panel de tamaño y calibración */}
      {panel && (
        <div style={{ position: "absolute", top: 58, right: 12, zIndex: 5, width: 340, maxWidth: "calc(100vw - 24px)", maxHeight: "calc(100% - 70px)", overflowY: "auto",
          background: "#101012", border: "1px solid #2a2a2e", borderRadius: 14, padding: 14, boxShadow: "0 18px 40px rgba(0,0,0,.7)", display: "grid", gap: 14 }}>
          <div>
            <p style={etq}>Tamaño del teclado</p>
            <div style={{ marginTop: 6 }}>
              <Opciones etiqueta="Tamaño" valor={real ? "real" : ajuste ? "ajuste" : "fija"}
                onCambia={v => { if (v === "fija") setEscala(Math.round(k * 20) / 20); setReal(v === "real"); setAjuste(v === "ajuste"); }}
                opciones={[["ajuste", "Ajustar"], ["real", "Tamaño real"], ["fija", "Medida fija"]]} />
            </div>
            {enReal && <p style={{ fontSize: 12.5, color: "#9a9aa0", margin: "8px 0 0" }}>Mide lo mismo que el instrumento si la pantalla está bien calibrada (abajo).</p>}
            {!ajuste && !enReal && (
              <label style={{ display: "block", marginTop: 10, fontSize: 13, color: "#c8c8cc" }}>
                Escala: {Math.round(escala * 100)} %
                <input type="range" min="0.3" max="4" step="0.05" value={escala} onChange={e => setEscala(parseFloat(e.target.value))} style={{ width: "100%", height: 36 }} />
              </label>
            )}
          </div>
          <div>
            <p style={etq}>Lo que mide ahora</p>
            <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6, color: "#d6d6da" }}>
              {manos.map((m, i) => (
                <div key={m}>{m === "izq" ? "Izquierdo" : "Derecho"}: {cm(G[i].W * k / pxcm)} × {cm(G[i].H * k / pxcm)} cm</div>
              ))}
              <div>Cada botón: {cm((BTN_SIZE + extra) * k / pxcm * 10)} mm de diámetro</div>
            </div>
          </div>
          <div>
            <p style={etq}>Calibrar la pantalla</p>
            <p style={{ fontSize: 12.5, color: "#9a9aa0", margin: "6px 0 8px" }}>Apoyá una regla sobre la barra y movela hasta que mida justo 10 cm. Con el zoom del navegador al 100 %. El valor de partida es una estimación según el aparato.</p>
            <div style={{ width: pxcm * 10, maxWidth: "100%", height: 14, borderRadius: 3, background: "#ececec", position: "relative" }}>
              {[0, 5, 10].map(c => <span key={c} style={{ position: "absolute", left: c === 10 ? "auto" : `${c * 10}%`, right: c === 10 ? 0 : "auto", top: 14, fontSize: 10, color: "#9a9aa0" }}>{c} cm</span>)}
            </div>
            <input type="range" min="20" max="80" step="0.1" value={pxcm} onChange={e => setPxcm(parseFloat(e.target.value))} style={{ width: "100%", height: 36, marginTop: 22 }} />
            <button onClick={() => setPxcm(pxcmBase())} style={{ ...boton, minHeight: 34, fontSize: 12.5 }}>Volver al valor estimado</button>
          </div>
        </div>
      )}

      {alinear && (
        <PanelAlinear lado={ladoPanel} onLado={() => setLadoPanel(l => l === "right" ? "left" : "right")} p={p} mueve={mueve} centrar={() => setPos(a => ({ ...a, [clave]: CERO }))}
          paso={paso} onPaso={setPaso} sel={sel} onSel={setSel} hayAmbas={mano === "ambas"} calib={calib} onCalib={() => { setCalib(c => !c); setToques([]); }}
          nToques={toquesSel.length} res={res} onAplicar={() => aplicar(false)} onAplicarTam={() => aplicar(true)} onBorrar={() => setToques([])}
          onCerrar={() => { setAlinear(false); setCalib(false); }} abrirTamano={() => setPanel(true)} />
      )}

      {/* Escena. La franja de presión va del lado de la mano libre: a la izquierda (o con ambas), a la derecha si se toca con la izquierda */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: mano === "izq" ? "row-reverse" : "row" }}>
        {!alinear && <FranjaFuelle valor={presion} onCambia={setPresion} />}   {/* al alinear no hace falta y deja libre el costado */}
        <div ref={escenaRef} onPointerDown={empezarArrastre} onPointerMove={seguirArrastre} onPointerUp={terminarArrastre} onPointerCancel={terminarArrastre}
          style={{ flex: 1, minWidth: 0, minHeight: 0, display: "flex", overflow: ajuste && !enReal ? "hidden" : "auto", touchAction: (ajuste && !enReal) || alinear ? "none" : "pan-x pan-y" }}>
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

      {/* A tamaño real: capa sobre toda la pantalla, centrada en ella; solo las teclas reciben toques */}
      {enReal && (
        <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
          {colocados.map((c, i) => (
            <div key={c.mano} style={{ position: "absolute", left: c.left, top: c.top, width: c.w, height: c.h, transformOrigin: "50% 50%", pointerEvents: "none",
              transform: `translate(${c.tx}px, ${c.ty}px) rotate(${c.rot}deg)` }}>
              <div style={{ position: "relative", width: G[i].W, height: G[i].H, transform: `scale(${kReal})`, transformOrigin: "top left", borderRadius: 16, pointerEvents: "none",
                background: alinear ? "rgba(255,255,255,.04)" : "linear-gradient(145deg,#1d1d1d,#101010)", boxShadow: alinear ? "none" : "0 14px 22px -10px rgba(0,0,0,.95)" }}>
                {G[i].items.map(it => alinear
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
