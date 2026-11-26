// Las piezas visuales de la pestaña Ejecución: la tecla, el disco de alineación, los selectores,
// la franja de presión del fuelle y el panel «Alinear» (para acomodar el teclado físico sobre la pantalla).

import { useRef } from "react";
import { LAT } from "../../shared/teoria/notas.js";
import { nc } from "../../shared/teoria/color.js";
import { UI_FONT } from "../../shared/ui/tema.js";
import { BTN_SIZE } from "../../shared/bandoneon/layouts.js";
import { AGUJERO_MM } from "./disposicionReal.js";
import { U } from "./ejecucionGeometria.js";

const nombre = (lat) => lat.charAt(0) + lat.slice(1).toLowerCase();
const octDe = (b, fuelle) => fuelle === "abre"
  ? (b.oct_abre ?? (b.id.startsWith("L") ? 2 : 4))
  : (b.oct_cierra ?? (b.id.startsWith("L") ? 2 : 4));
const coma = (v, d = 1) => v.toFixed(d).replace(".", ",");
const suelta = (arriba, id) => ({ onPointerUp: () => arriba(id), onPointerCancel: () => arriba(id), onPointerLeave: () => arriba(id), onContextMenu: e => e.preventDefault() });
const base = { position: "absolute", pointerEvents: "auto", cursor: "pointer", touchAction: "none", userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" };

// ── Una tecla: suena mientras se la toca, varias a la vez ──
export function Tecla({ it, fuelle, activa, abajo, arriba, extra }) {
  const { b, x, y } = it;
  const lat = fuelle === "abre" ? b.abre : b.cierra;
  const oct = octDe(b, fuelle);
  const col = nc(LAT[lat] || lat);
  const d = BTN_SIZE + extra;   // el centro no se mueve: crece parejo hacia todos lados
  return (
    <div data-btn={b.id} onPointerDown={e => { e.preventDefault(); abajo(b, lat, oct, e); }} {...suelta(arriba, b.id)}
      style={{
        ...base, left: x - extra / 2, top: y - extra / 2, width: d, height: d, borderRadius: "50%", boxSizing: "border-box",
        display: "flex", alignItems: "center", justifyContent: "center",
        background: activa
          ? `radial-gradient(circle at 36% 30%,${col}ff,${col}cc 55%,${col}88)`
          : `radial-gradient(circle at 36% 30%,${col}99,${col}44 60%,${col}22)`,
        border: `2.5px solid ${activa ? "#ffffff" : col + "aa"}`,
        boxShadow: activa ? `0 0 18px ${col}cc, 0 0 0 2px ${col}55` : "0 2px 8px rgba(0,0,0,.7)",
        transform: activa ? "scale(0.95)" : "scale(1)", transition: "transform .08s, box-shadow .12s", zIndex: activa ? 20 : 1,
      }}>
      <div style={{ position: "absolute", top: 5, left: 9, width: 11, height: 7, borderRadius: "50%", background: "rgba(255,255,255,.22)", filter: "blur(1px)", pointerEvents: "none" }} />
      <span style={{ display: "flex", alignItems: "baseline", gap: 1, lineHeight: 1, pointerEvents: "none", textShadow: "0 1px 3px rgba(0,0,0,.9)", fontFamily: "'Courier New',monospace", color: "#fff" }}>
        <span style={{ fontSize: lat.length > 2 ? 9 : 11, fontWeight: 800 }}>{nombre(lat)}</span>
        <span style={{ fontSize: lat.length > 2 ? 10 : 12, fontWeight: 900, opacity: .95 }}>{oct}</span>
      </span>
    </div>
  );
}

// ── Disco de alineación: un disco blanco, un poco menor que el agujero, con cruz roja en el centro.
// Con el teclado físico encima, si coincide se ve el disco entero con un aro oscuro alrededor; si no, queda cortado.
// Las teclas de las esquinas llevan un aro amarillo. No suena: al tocarlo solo se enciende en verde y se anota el toque. ──
export function Disco({ it, activa, abajo, arriba, esquina }) {
  const { b, x, y } = it;
  const dd = (AGUJERO_MM - 1) * U, off = (BTN_SIZE - dd) / 2;
  const cruz = "linear-gradient(#d11,#d11) center/1.4px 100% no-repeat, linear-gradient(#d11,#d11) center/100% 1.4px no-repeat";
  return (
    <div data-btn={b.id} onPointerDown={e => { e.preventDefault(); abajo(b, null, null, e); }} {...suelta(arriba, b.id)}
      style={{ ...base, left: x + off, top: y + off, width: dd, height: dd, borderRadius: "50%", boxSizing: "border-box",
        background: `${cruz}, ${activa ? "#3ddc84" : "#fff"}`, outline: esquina ? "3px solid #ffd400" : "none", outlineOffset: 3, zIndex: activa ? 20 : 1 }}>
      <span style={{ position: "absolute", left: 0, right: 0, top: "60%", textAlign: "center", fontSize: 9, fontWeight: 700, color: "#333", fontFamily: UI_FONT, pointerEvents: "none" }}>{b.id}</span>
    </div>
  );
}

// ── Selector de opciones, grande para tocar con el dedo ──
export function Opciones({ valor, opciones, onCambia, etiqueta }) {
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

// ── Franja de presión del fuelle: se mueve con el dedo de la mano libre, también mientras suena una nota ──
export function FranjaFuelle({ valor, onCambia }) {
  const ref = useRef(null);
  const mover = (e) => {
    const r = ref.current.getBoundingClientRect();
    onCambia(Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height)));
  };
  const rotulo = { fontFamily: UI_FONT, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7c7c82", fontWeight: 600 };
  return (
    <div style={{ position: "relative", zIndex: 2, width: 76, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "12px 6px", userSelect: "none", WebkitUserSelect: "none", touchAction: "none" }}>
      <span style={rotulo}>Fuerte</span>
      <div ref={ref} role="slider" aria-label="Presión del fuelle" aria-orientation="vertical" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(valor * 100)}
        onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); mover(e); }}
        onPointerMove={e => { if (e.currentTarget.hasPointerCapture(e.pointerId)) mover(e); }}
        style={{ flex: 1, width: 52, minHeight: 80, borderRadius: 26, background: "#121214", border: "1px solid #2a2a2e", position: "relative", overflow: "hidden", touchAction: "none", cursor: "ns-resize" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${valor * 100}%`, background: "linear-gradient(180deg,#ececec,#6d6d73)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: `calc(${valor * 100}% - 2px)`, height: 4, background: "#ffffff", boxShadow: "0 0 8px rgba(255,255,255,.6)" }} />
      </div>
      <span style={rotulo}>Suave</span>
      <span style={{ ...rotulo, color: "#a8a8ae", textTransform: "none", letterSpacing: 0 }}>Fuelle</span>
    </div>
  );
}

// ── Panel «Alinear»: acomodar el teclado dibujado debajo del teclado físico ──
// Es una columna angosta para dejarla al costado, fuera de la lámina de silicona (⇄ la pasa al otro lado).
// p: {dx, dy, rot} del teclado elegido (mm y grados). mueve(ddx, ddy, drot) en mm y grados. res: ajuste calculado con los toques, o null.
export function PanelAlinear({ lado, onLado, p, mueve, centrar, paso, onPaso, sel, onSel, hayAmbas, calib, onCalib, nToques, res, onAplicar, onAplicarTam, onBorrar, onCerrar, abrirTamano }) {
  const boton = { fontFamily: UI_FONT, fontSize: 13, fontWeight: 600, minHeight: 44, minWidth: 44, borderRadius: 10, cursor: "pointer", background: "#17171a", border: "1px solid #2f2f34", color: "#e4e4e8", touchAction: "manipulation", padding: 0 };
  const chico = (on) => ({ ...boton, minHeight: 38, flex: 1, minWidth: 0, background: on ? "#ececec" : "#17171a", color: on ? "#101012" : "#e4e4e8" });
  const etq = { fontFamily: UI_FONT, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7c7c82", fontWeight: 600, margin: "0 0 6px" };
  const nota = { fontSize: 12, color: "#9a9aa0", margin: "6px 0 0", lineHeight: 1.4 };
  const dato = { fontSize: 12.5, lineHeight: 1.5, color: "#d6d6da" };
  const gr = paso === 1 ? 1 : 0.1;
  const flecha = (txt, dx, dy, aria) => <button style={boton} aria-label={aria} onClick={() => mueve(dx * paso, dy * paso, 0)}>{txt}</button>;
  return (
    <div style={{ position: "absolute", bottom: 12, [lado]: 8, zIndex: 6, width: 168, maxHeight: "calc(100% - 130px)", overflowY: "auto",
      background: "rgba(16,16,18,.97)", border: "1px solid #2a2a2e", borderRadius: 14, padding: 10, boxShadow: "0 18px 40px rgba(0,0,0,.7)", display: "grid", gap: 12, fontFamily: UI_FONT, color: "#ececec" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <p style={{ ...etq, flex: 1, margin: 0 }}>Alinear</p>
        <button style={{ ...boton, minHeight: 36, minWidth: 36 }} onClick={onLado} aria-label="Pasar el panel al otro lado">⇄</button>
        <button style={{ ...boton, minHeight: 36, minWidth: 36 }} onClick={onCerrar} aria-label="Cerrar alinear">✕</button>
      </div>
      {hayAmbas && (
        <div><p style={etq}>Mover</p><div style={{ display: "flex", gap: 6 }}>
          <button style={chico(sel === "izq")} onClick={() => onSel("izq")} aria-pressed={sel === "izq"}>Izq.</button>
          <button style={chico(sel === "der")} onClick={() => onSel("der")} aria-pressed={sel === "der"}>Der.</button></div></div>
      )}
      <div>
        <p style={etq}>Paso</p>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={chico(paso === 1)} onClick={() => onPaso(1)} aria-pressed={paso === 1}>1 mm</button>
          <button style={chico(paso === 0.1)} onClick={() => onPaso(0.1)} aria-pressed={paso === 0.1}>0,1 mm</button>
        </div>
        <p style={nota}>Giro: {paso === 1 ? "1°" : "0,1°"} por toque.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,46px)", gap: 6, justifyContent: "center" }}>
        <button style={boton} aria-label="Girar a la izquierda" onClick={() => mueve(0, 0, -gr)}>⟲</button>
        {flecha("▲", 0, -1, "Subir")}
        <button style={boton} aria-label="Girar a la derecha" onClick={() => mueve(0, 0, gr)}>⟳</button>
        {flecha("◀", -1, 0, "Mover a la izquierda")}
        <button style={{ ...boton, fontSize: 10.5 }} aria-label="Centrar el teclado" onClick={centrar}>Centrar</button>
        {flecha("▶", 1, 0, "Mover a la derecha")}
        <span />
        {flecha("▼", 0, 1, "Bajar")}
        <span />
      </div>
      <div style={dato}>
        <div>→ {coma(p.dx)} mm</div><div>↓ {coma(p.dy)} mm</div><div>⟳ {coma(p.rot)}°</div>
      </div>
      <div style={{ borderTop: "1px solid #232326", paddingTop: 10 }}>
        <p style={etq}>Con toques</p>
        <button style={chico(calib)} onClick={onCalib} aria-pressed={calib}>{calib ? "Tomando…" : "Empezar"}</button>
        {calib && <p style={nota}>{nToques === 0 ? "Tocá las esquinas amarillas." : `${nToques} ${nToques === 1 ? "toque" : "toques"}.`}</p>}
        {nToques > 0 && <button style={{ ...chico(false), marginTop: 6, width: "100%", flex: "none" }} onClick={onBorrar}>Borrar toques</button>}
        {res && (
          <div style={{ ...dato, marginTop: 8 }}>
            <div>Correr {coma(res.dxmm)} mm y {coma(res.dymm)} mm</div>
            {nToques >= 2 && <div>Girar {coma(res.giro)}°</div>}
            {nToques >= 2 && <div>Tamaño {coma(res.escala * 100)} %</div>}
            <button style={{ ...chico(false), marginTop: 6, width: "100%", flex: "none" }} onClick={onAplicar}>Aplicar</button>
            {nToques >= 3 && Math.abs(res.escala - 1) > 0.003 && <button style={{ ...chico(false), marginTop: 6, width: "100%", flex: "none" }} onClick={onAplicarTam}>Aplicar con tamaño</button>}
          </div>
        )}
      </div>
      <details style={{ fontSize: 12, color: "#9a9aa0" }}>
        <summary style={{ cursor: "pointer", padding: "6px 0", fontWeight: 600, color: "#c8c8cc" }}>Ayuda</summary>
        <p style={nota}>Tamaño real. Con el teclado físico encima, los discos blancos tienen que verse enteros por los agujeros, con un aro oscuro alrededor.</p>
        <p style={nota}>Arrastrá un dedo por la zona libre de la pantalla para mover el teclado dibujado.</p>
        <p style={nota}>«Con toques»: tocá por los agujeros las cuatro teclas amarillas (y más si querés). La app calcula cuánto corrido, girado y de qué tamaño está.</p>
      </details>
      <button style={{ ...boton, fontSize: 12, minHeight: 40 }} onClick={abrirTamano}>Calibrar pantalla</button>
    </div>
  );
}
