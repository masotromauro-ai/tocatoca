// La pestaña Ejecución: el instrumento virtual en pantalla completa, para tocar.
// Dos formas: «Piano» (teclados horizontales, manos rectas) y «Real» (teclados verticales,
// el izquierdo a la izquierda y el derecho a la derecha). Se toca de a una mano por vez
// (también está «Ambas»). Cada teclado se puede fijar a una medida exacta, calibrada en
// centímetros, para que coincida con la capa de silicona conductora puesta sobre la pantalla.

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { LAT } from "../../shared/teoria/notas.js";
import { nc } from "../../shared/teoria/color.js";
import { UI_FONT } from "../../shared/ui/tema.js";
import { BTN_SIZE } from "../../shared/bandoneon/layouts.js";
import { loadBtns } from "../../shared/bandoneon/almacen.js";
import { useSonidoBandoneon } from "./hooks.jsx";

const PAD = 14;          // margen del teclado alrededor de los botones
const GAP = 48;          // separación entre teclados cuando se muestran los dos
const MAX_ESCALA = 3.2;  // tope al ajustar a la pantalla
const CLAVE = "bandomaps_ejecucion";   // ajustes de esta pestaña en el teléfono (clave nueva)
const PXCM_BASE = 96 / 2.54;           // píxeles CSS por centímetro, antes de calibrar

// Sentido del giro en la forma «Real» (un cuarto de vuelta, según el profesor):
// derecha: el borde derecho del dibujo (Sol agudo) queda abajo, girando hacia la derecha ("cw");
// izquierda: el borde izquierdo (Re 1) queda abajo, girando hacia la izquierda ("ccw").
const GIRO = { izq: "ccw", der: "cw" };

// ── Geometría (pura): dónde cae cada botón y cuánto mide el teclado ──
export function geometria(btns, forma, mano) {
  if (!btns.length) return { W: 2 * PAD, H: 2 * PAD, items: [] };
  const iw = Math.max(...btns.map(b => b.x)) + BTN_SIZE;   // ancho del dibujo original
  const ih = Math.max(...btns.map(b => b.y)) + BTN_SIZE;   // alto del dibujo original
  if (forma !== "real") {
    return { W: iw + 2 * PAD, H: ih + 2 * PAD, items: btns.map(b => ({ b, x: b.x + PAD, y: b.y + PAD })) };
  }
  const ccw = GIRO[mano] !== "cw";
  return {
    W: ih + 2 * PAD, H: iw + 2 * PAD,
    items: btns.map(b => ccw
      ? { b, x: b.y + PAD,                 y: iw - (b.x + BTN_SIZE) + PAD }
      : { b, x: ih - (b.y + BTN_SIZE) + PAD, y: b.x + PAD }),
  };
}

const cm = (v) => v.toFixed(1).replace(".", ",");
const nombre = (lat) => lat.charAt(0) + lat.slice(1).toLowerCase();
const octDe = (b, fuelle) => fuelle === "abre"
  ? (b.oct_abre ?? (b.id.startsWith("L") ? 2 : 4))
  : (b.oct_cierra ?? (b.id.startsWith("L") ? 2 : 4));

function leerAjustes() {
  try {
    const a = JSON.parse(localStorage.getItem(CLAVE) || "{}");
    return {
      forma: a.forma === "real" ? "real" : "piano",
      mano: ["izq", "der", "ambas"].includes(a.mano) ? a.mano : "der",
      ajuste: a.ajuste !== false,
      escala: Number.isFinite(a.escala) ? Math.min(4, Math.max(0.3, a.escala)) : 1,
      pxcm: Number.isFinite(a.pxcm) ? Math.min(80, Math.max(20, a.pxcm)) : PXCM_BASE,
    };
  } catch (e) { return { forma: "piano", mano: "der", ajuste: true, escala: 1, pxcm: PXCM_BASE }; }
}

// ── Una tecla: suena mientras se la toca, varias a la vez ──
function Tecla({ it, fuelle, activa, abajo, arriba }) {
  const { b, x, y } = it;
  const lat = fuelle === "abre" ? b.abre : b.cierra;
  const oct = octDe(b, fuelle);
  const col = nc(LAT[lat] || lat);
  return (
    <div
      data-btn={b.id}
      onPointerDown={e => { e.preventDefault(); abajo(b, lat, oct); }}
      onPointerUp={() => arriba(b.id)}
      onPointerCancel={() => arriba(b.id)}
      onPointerLeave={() => arriba(b.id)}
      onContextMenu={e => e.preventDefault()}
      style={{
        position: "absolute", left: x, top: y, width: BTN_SIZE, height: BTN_SIZE, borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", touchAction: "none", userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none",
        background: activa
          ? `radial-gradient(circle at 36% 30%,${col}ff,${col}cc 55%,${col}88)`
          : `radial-gradient(circle at 36% 30%,${col}99,${col}44 60%,${col}22)`,
        border: `2.5px solid ${activa ? "#ffffff" : col + "aa"}`,
        boxShadow: activa ? `0 0 18px ${col}cc, 0 0 0 2px ${col}55` : "0 2px 8px rgba(0,0,0,.7)",
        transform: activa ? "scale(0.95)" : "scale(1)",
        transition: "transform .08s, box-shadow .12s",
        zIndex: activa ? 20 : 1,
      }}>
      <div style={{ position: "absolute", top: 5, left: 9, width: 11, height: 7, borderRadius: "50%", background: "rgba(255,255,255,.22)", filter: "blur(1px)", pointerEvents: "none" }} />
      <span style={{ display: "flex", alignItems: "baseline", gap: 1, lineHeight: 1, pointerEvents: "none", textShadow: "0 1px 3px rgba(0,0,0,.9)", fontFamily: "'Courier New',monospace", color: "#fff" }}>
        <span style={{ fontSize: lat.length > 2 ? 9 : 11, fontWeight: 800 }}>{nombre(lat)}</span>
        <span style={{ fontSize: lat.length > 2 ? 10 : 12, fontWeight: 900, opacity: .95 }}>{oct}</span>
      </span>
    </div>
  );
}

// ── Selector de opciones, grande para tocar con el dedo ──
function Opciones({ valor, opciones, onCambia, etiqueta }) {
  return (
    <div role="group" aria-label={etiqueta} style={{ display: "inline-flex", background: "#121214", border: "1px solid #2a2a2e", borderRadius: 12, padding: 3, gap: 3 }}>
      {opciones.map(([v, txt]) => {
        const on = v === valor;
        return (
          <button key={v} onClick={() => onCambia(v)} aria-pressed={on}
            style={{ fontFamily: UI_FONT, fontSize: 14, fontWeight: on ? 700 : 500, padding: "9px 16px", minHeight: 40, borderRadius: 9, cursor: "pointer",
              border: "none", background: on ? "#ececec" : "transparent", color: on ? "#101012" : "#a8a8ae" }}>
            {txt}
          </button>
        );
      })}
    </div>
  );
}

export function EjecucionTab({ onSalir }) {
  const inicial = useMemo(leerAjustes, []);
  const datos = useMemo(() => loadBtns(), []);
  const [forma, setForma] = useState(inicial.forma);
  const [mano, setMano] = useState(inicial.mano);
  const [ajuste, setAjuste] = useState(inicial.ajuste);
  const [escala, setEscala] = useState(inicial.escala);
  const [pxcm, setPxcm] = useState(inicial.pxcm);
  const [fuelle, setFuelle] = useState("abre");
  const [panel, setPanel] = useState(false);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [pulsadas, setPulsadas] = useState([]);
  const [area, setArea] = useState({ w: 0, h: 0 });
  const escenaRef = useRef(null);
  const { startNote, stopNote, stopAllNotes } = useSonidoBandoneon({ bellows: fuelle });

  // Guarda los ajustes de la pestaña
  useEffect(() => {
    try { localStorage.setItem(CLAVE, JSON.stringify({ forma, mano, ajuste, escala, pxcm })); } catch (e) {}
  }, [forma, mano, ajuste, escala, pxcm]);

  // Mide el espacio libre para el teclado
  useEffect(() => {
    const el = escenaRef.current; if (!el) return;
    const medir = () => setArea({ w: el.clientWidth, h: el.clientHeight });
    medir();
    let ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(medir); ro.observe(el); }
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

  // Cambiar fuelle, mano o forma corta lo que esté sonando
  useEffect(() => { stopAllNotes(); setPulsadas([]); }, [fuelle, mano, forma, stopAllNotes]);

  const abajo = useCallback((b, lat, oct) => {
    startNote(b.id, LAT[lat] || lat, oct);
    setPulsadas(p => p.includes(b.id) ? p : [...p, b.id]);
  }, [startNote]);
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
  const manos = mano === "ambas" ? ["izq", "der"] : [mano];
  const G = manos.map(m => geometria(m === "izq" ? datos.left : datos.right, forma, m));
  const TW = G.reduce((s, g) => s + g.W, 0) + GAP * (G.length - 1);
  const TH = Math.max(...G.map(g => g.H));
  const ajustada = Math.min(Math.max(60, area.w - 24) / TW, Math.max(60, area.h - 24) / TH, MAX_ESCALA);
  const k = ajuste ? ajustada : escala;

  const boton = { fontFamily: UI_FONT, fontSize: 14, fontWeight: 600, minHeight: 40, padding: "0 14px", borderRadius: 10, cursor: "pointer", background: "#121214", border: "1px solid #2a2a2e", color: "#d6d6da" };
  const etq = { fontFamily: UI_FONT, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7c7c82", fontWeight: 600 };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", flexDirection: "column", background: "linear-gradient(160deg,#09090a 0%,#0f0f10 55%,#111113 100%)", color: "#ececec", fontFamily: UI_FONT }}>
      {/* Barra: salir, las dos opciones del teclado, mano, fuelle */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: "1px solid #1f1f22", background: "rgba(10,10,11,.92)", flexShrink: 0 }}>
        <button onClick={onSalir} style={boton} aria-label="Salir de la ejecución">✕ Salir</button>
        <Opciones etiqueta="Forma del teclado" valor={forma} onCambia={setForma} opciones={[["piano", "Piano"], ["real", "Real"]]} />
        <Opciones etiqueta="Mano" valor={mano} onCambia={setMano} opciones={[["izq", "Izquierda"], ["der", "Derecha"], ["ambas", "Ambas"]]} />
        <Opciones etiqueta="Fuelle" valor={fuelle} onCambia={setFuelle} opciones={[["abre", "Abre"], ["cierra", "Cierra"]]} />
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => setPanel(p => !p)} style={{ ...boton, background: panel ? "#ececec" : "#121214", color: panel ? "#101012" : "#d6d6da" }} aria-expanded={panel}>⚙ Tamaño</button>
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
              <Opciones etiqueta="Tamaño" valor={ajuste ? "ajuste" : "fija"} onCambia={v => { if (v === "fija" && ajuste) setEscala(Math.round(ajustada * 20) / 20); setAjuste(v === "ajuste"); }}
                opciones={[["ajuste", "Ajustar a la pantalla"], ["fija", "Medida fija"]]} />
            </div>
            {!ajuste && (
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
              <div>Cada botón: {cm(BTN_SIZE * k / pxcm * 10)} mm de diámetro</div>
            </div>
          </div>
          <div>
            <p style={etq}>Calibrar la pantalla</p>
            <p style={{ fontSize: 12.5, color: "#9a9aa0", margin: "6px 0 8px" }}>Apoyá una regla sobre la barra y movela hasta que mida justo 10 cm. Con el zoom del navegador al 100 %.</p>
            <div style={{ width: pxcm * 10, maxWidth: "100%", height: 14, borderRadius: 3, background: "#ececec", position: "relative" }}>
              {[0, 5, 10].map(c => <span key={c} style={{ position: "absolute", left: c === 10 ? "auto" : `${c * 10}%`, right: c === 10 ? 0 : "auto", top: 14, fontSize: 10, color: "#9a9aa0" }}>{c} cm</span>)}
            </div>
            <input type="range" min="20" max="80" step="0.1" value={pxcm} onChange={e => setPxcm(parseFloat(e.target.value))} style={{ width: "100%", height: 36, marginTop: 22 }} />
            <button onClick={() => setPxcm(PXCM_BASE)} style={{ ...boton, minHeight: 34, fontSize: 12.5 }}>Volver al valor de fábrica</button>
          </div>
        </div>
      )}

      {/* Escena: el teclado, centrado */}
      <div ref={escenaRef} style={{ flex: 1, minHeight: 0, display: "flex", overflow: ajuste ? "hidden" : "auto", touchAction: ajuste ? "none" : "pan-x pan-y" }}>
        <div style={{ margin: "auto", display: "flex", gap: GAP * k, padding: 12, alignItems: "center" }}>
          {G.map((g, i) => (
            <div key={manos[i]} style={{ width: Math.ceil(g.W * k), height: Math.ceil(g.H * k), flexShrink: 0 }}>
              <div style={{
                position: "relative", width: g.W, height: g.H, transform: `scale(${k})`, transformOrigin: "top left",
                background: "linear-gradient(145deg,#1d1d1d,#101010)", borderRadius: 16,
                boxShadow: "0 14px 22px -10px rgba(0,0,0,.95)", touchAction: "none",
              }}>
                {g.items.map(it => <Tecla key={it.b.id} it={it} fuelle={fuelle} activa={pulsadas.includes(it.b.id)} abajo={abajo} arriba={arriba} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
