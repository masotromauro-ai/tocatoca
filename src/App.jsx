import { useState, useCallback, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────
const ALL_NOTES = ["DO","DO#","RE","RE#","MI","FA","FA#","SOL","SOL#","LA","LA#","SI"];

// Colores por defecto de cada nota
const DEFAULT_NOTE_COLORS = {
  "DO":"#ef4444","DO#":"#f97316","RE":"#eab308","RE#":"#84cc16",
  "MI":"#22c55e","FA":"#14b8a6","FA#":"#06b6d4","SOL":"#3b82f6",
  "SOL#":"#6366f1","LA":"#8b5cf6","LA#":"#d946ef","SI":"#ec4899",
};

// Estado global de colores (se puede editar)
function useNoteColors() {
  const [colors, setColors] = useState({...DEFAULT_NOTE_COLORS});
  const setColor = (note, color) => setColors(prev => ({...prev, [note]: color}));
  const nc = (note) => colors[note] || "#94a3b8";
  return { colors, nc, setColor };
}

// SNAP más fino: 2px (60% más preciso que 6px anterior)
const SNAP = 2;
function snapV(v) { return Math.round(v / SNAP) * SNAP; }

const BTN = 44;

// ─────────────────────────────────────────────────────────────────
// COORDENADAS MANO IZQUIERDA
// L01–L15: coordenadas exactas ingresadas manualmente por el usuario
// L16–L33: coordenadas anteriores (pendiente completar con el usuario)
// ─────────────────────────────────────────────────────────────────
const DEFS_L = [
  // ── FILA 0 — 5 botones ──────────────────────────────────────
  { id:"L01", row:0, x:143, y: 39, abre:"SOL#", cierra:"SOL#", color:"" },
  { id:"L02", row:0, x:247, y: 26, abre:"LA#",  cierra:"LA#",  color:"" },
  { id:"L03", row:0, x:351, y: 26, abre:"DO#",  cierra:"RE#",  color:"" },
  { id:"L04", row:0, x:442, y: 39, abre:"FA",   cierra:"RE#",  color:"" },
  { id:"L05", row:0, x:559, y: 78, abre:"SOL#", cierra:"SOL",  color:"" },

  // ── FILA 1 — 7 botones ──────────────────────────────────────
  { id:"L06", row:1, x: 39, y:117, abre:"MI",   cierra:"RE",   color:"" },
  { id:"L07", row:1, x:117, y:117, abre:"LA",   cierra:"RE",   color:"" },
  { id:"L08", row:1, x:195, y: 91, abre:"SOL",  cierra:"LA#",  color:"" },
  { id:"L09", row:1, x:299, y: 91, abre:"RE#",  cierra:"DO",   color:"" },
  { id:"L10", row:1, x:403, y:104, abre:"FA",   cierra:"DO#",  color:"" },
  { id:"L11", row:1, x:494, y:117, abre:"LA#",  cierra:"DO",   color:"" },
  { id:"L12", row:1, x:611, y:143, abre:"FA",   cierra:"FA#",  color:"" },

  // ── FILA 2 — 6 botones ──────────────────────────────────────
  // L13–L15 del usuario, L16–L18 pendientes
  { id:"L13", row:2, x: 78, y:182, abre:"RE",   cierra:"SOL",  color:"" },
  { id:"L14", row:2, x:169, y:182, abre:"LA",   cierra:"SOL",  color:"" },
  { id:"L15", row:2, x:247, y:156, abre:"DO",   cierra:"SI",   color:"" },
  { id:"L16", row:2, x:338, y:156, abre:"RE",   cierra:"FA#",  color:"" },
  { id:"L17", row:2, x:429, y:169, abre:"FA#",  cierra:"DO#",  color:"" },
  { id:"L18", row:2, x:520, y:182, abre:"DO#",  cierra:"FA#",  color:"" },

  // ── FILA 3 — 7 botones ──────────────────────────────────────
  { id:"L19", row:3, x: 39, y:234, abre:"MI",   cierra:"SOL#", color:"" },
  { id:"L20", row:3, x:117, y:234, abre:"SOL#", cierra:"SOL",  color:"" },
  { id:"L21", row:3, x:195, y:221, abre:"SOL",  cierra:"LA",   color:"" },
  { id:"L22", row:3, x:286, y:221, abre:"LA",   cierra:"RE#",  color:"" },
  { id:"L23", row:3, x:377, y:221, abre:"RE#",  cierra:"FA#",  color:"" },
  { id:"L24", row:3, x:468, y:234, abre:"FA#",  cierra:"SOL#", color:"" },
  { id:"L25", row:3, x:559, y:247, abre:"FA#",  cierra:"SI",   color:"" },

  // ── FILA 4 — 8 botones ──────────────────────────────────────
  { id:"L26", row:4, x:  4, y:286, abre:"RE",   cierra:"MI",   color:"" },
  { id:"L27", row:4, x: 82, y:299, abre:"SI",   cierra:"SI",   color:"" },
  { id:"L28", row:4, x:169, y:299, abre:"MI",   cierra:"SOL",  color:"" },
  { id:"L29", row:4, x:260, y:299, abre:"LA",   cierra:"LA",   color:"" },
  { id:"L30", row:4, x:351, y:299, abre:"RE#",  cierra:"SI",   color:"" },
  { id:"L31", row:4, x:442, y:299, abre:"FA#",  cierra:"FA",   color:"" },
  { id:"L32", row:4, x:533, y:286, abre:"RE#",  cierra:"DO#",  color:"" },
  { id:"L33", row:4, x:611, y:273, abre:"DO",   cierra:"FA",   color:"" },
];

// ─────────────────────────────────────────────────────────────────
// COORDENADAS MANO DERECHA (pendiente CSV del usuario)
// ─────────────────────────────────────────────────────────────────
const DEFS_R = [
  { id:"R01", row:0, x:  4, y: 14, abre:"SI",   cierra:"SI",   color:"" },
  { id:"R02", row:0, x: 56, y: 14, abre:"SOL#", cierra:"SOL#", color:"" },
  { id:"R03", row:0, x:108, y: 14, abre:"SOL",  cierra:"SOL#", color:"" },
  { id:"R04", row:0, x:160, y: 14, abre:"SOL",  cierra:"SOL",  color:"" },
  { id:"R05", row:0, x:212, y: 14, abre:"LA",   cierra:"SOL",  color:"" },
  { id:"R06", row:0, x:264, y: 14, abre:"FA",   cierra:"FA",   color:"" },
  { id:"R07", row:0, x:316, y: 14, abre:"FA",   cierra:"RE#",  color:"" },
  { id:"R08", row:1, x:  4, y: 66, abre:"DO",   cierra:"LA",   color:"" },
  { id:"R09", row:1, x: 56, y: 66, abre:"RE",   cierra:"FA#",  color:"" },
  { id:"R10", row:1, x:108, y: 66, abre:"SOL",  cierra:"MI",   color:"" },
  { id:"R11", row:1, x:160, y: 66, abre:"FA#",  cierra:"LA",   color:"" },
  { id:"R12", row:1, x:212, y: 66, abre:"LA#",  cierra:"DO",   color:"" },
  { id:"R13", row:1, x:264, y: 66, abre:"DO",   cierra:"RE#",  color:"" },
  { id:"R14", row:1, x:316, y: 66, abre:"RE#",  cierra:"MI",   color:"" },
  { id:"R15", row:1, x:368, y: 66, abre:"MI",   cierra:"RE#",  color:"" },
  { id:"R16", row:2, x:  4, y:118, abre:"SI",   cierra:"DO",   color:"" },
  { id:"R17", row:2, x: 56, y:118, abre:"MI",   cierra:"DO#",  color:"" },
  { id:"R18", row:2, x:108, y:118, abre:"DO#",  cierra:"FA#",  color:"" },
  { id:"R19", row:2, x:160, y:118, abre:"FA#",  cierra:"SI",   color:"" },
  { id:"R20", row:2, x:212, y:118, abre:"LA",   cierra:"RE",   color:"" },
  { id:"R21", row:2, x:264, y:118, abre:"RE#",  cierra:"FA#",  color:"" },
  { id:"R22", row:2, x:316, y:118, abre:"FA#",  cierra:"LA",   color:"" },
  { id:"R23", row:2, x:368, y:118, abre:"LA",   cierra:"RE",   color:"" },
  { id:"R24", row:2, x:420, y:118, abre:"RE",   cierra:"SOL#", color:"" },
  { id:"R25", row:3, x:  4, y:170, abre:"FA",   cierra:"LA",   color:"" },
  { id:"R26", row:3, x: 56, y:170, abre:"LA",   cierra:"RE#",  color:"" },
  { id:"R27", row:3, x:108, y:170, abre:"RE#",  cierra:"FA#",  color:"" },
  { id:"R28", row:3, x:160, y:170, abre:"FA#",  cierra:"RE#",  color:"" },
  { id:"R29", row:3, x:212, y:170, abre:"RE#",  cierra:"FA#",  color:"" },
  { id:"R30", row:3, x:264, y:170, abre:"FA#",  cierra:"LA",   color:"" },
  { id:"R31", row:3, x:316, y:170, abre:"LA",   cierra:"DO",   color:"" },
  { id:"R32", row:3, x:368, y:170, abre:"SOL#", cierra:"SI",   color:"" },
  { id:"R33", row:4, x: 56, y:222, abre:"DO",   cierra:"SI",   color:"" },
  { id:"R34", row:4, x:108, y:222, abre:"LA",   cierra:"LA#",  color:"" },
  { id:"R35", row:4, x:160, y:222, abre:"DO",   cierra:"DO",   color:"" },
  { id:"R36", row:4, x:212, y:222, abre:"MI",   cierra:"MI",   color:"" },
  { id:"R37", row:4, x:264, y:222, abre:"SOL#", cierra:"SOL",  color:"" },
  { id:"R38", row:4, x:316, y:222, abre:"RE#",  cierra:"RE#",  color:"" },
];

// ─────────────────────────────────────────────────────────────────
// BOTÓN DRAGGABLE
// ─────────────────────────────────────────────────────────────────
function Key({ btn, mode, selected, onSelect, onMove, nc }) {
  const note  = mode === "abre" ? btn.abre : btn.cierra;
  const color = btn.color || nc(note);
  const isSel = selected === btn.id;

  const onMouseDown = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    onSelect(btn.id);
    const ox = e.clientX - btn.x;
    const oy = e.clientY - btn.y;
    const move = (e2) => onMove(btn.id,
      snapV(Math.max(0, e2.clientX - ox)),
      snapV(Math.max(0, e2.clientY - oy))
    );
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }, [btn, onSelect, onMove]);

  const onTouchStart = useCallback((e) => {
    e.stopPropagation();
    onSelect(btn.id);
    const t = e.touches[0];
    const ox = t.clientX - btn.x;
    const oy = t.clientY - btn.y;
    const move = (e2) => {
      e2.preventDefault();
      const t2 = e2.touches[0];
      onMove(btn.id,
        snapV(Math.max(0, t2.clientX - ox)),
        snapV(Math.max(0, t2.clientY - oy))
      );
    };
    const up = () => {
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
  }, [btn, onSelect, onMove]);

  return (
    <div onMouseDown={onMouseDown} onTouchStart={onTouchStart} style={{
      position: "absolute", left: btn.x, top: btn.y,
      width: BTN, height: BTN, borderRadius: "50%",
      cursor: "grab", touchAction: "none", userSelect: "none",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      zIndex: isSel ? 100 : 10,
      background: isSel
        ? `radial-gradient(circle at 36% 30%,${color}ff,${color}aa 55%,${color}66)`
        : `radial-gradient(circle at 36% 30%,${color}55,${color}22 60%,${color}11)`,
      border: `2px solid ${isSel ? color : color + "77"}`,
      boxShadow: isSel
        ? `0 0 18px ${color}cc, 0 0 36px ${color}44`
        : "0 2px 8px rgba(0,0,0,.7)",
      transition: "box-shadow .12s",
    }}>
      <div style={{
        position: "absolute", top: 5, left: 9, width: 11, height: 7,
        borderRadius: "50%", background: "rgba(255,255,255,.18)",
        filter: "blur(1px)", pointerEvents: "none",
      }}/>
      <span style={{
        fontSize: note.length > 2 ? 7.5 : 9.5, fontWeight: 800,
        color: isSel ? "#fff" : color,
        fontFamily: "'Courier New',monospace", lineHeight: 1, zIndex: 1,
        textShadow: isSel ? "0 1px 4px rgba(0,0,0,.9)" : "none",
      }}>{note}</span>
      <span style={{
        fontSize: 6.5, fontFamily: "monospace", lineHeight: 1, zIndex: 1,
        color: isSel ? "rgba(255,255,255,.75)" : color + "88",
      }}>{btn.id}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CANVAS
// ─────────────────────────────────────────────────────────────────
function Canvas({ buttons, mode, selected, onSelect, onMove, showGrid, nc }) {
  const W = Math.max(...buttons.map(b => b.x)) + BTN + 24;
  const H = Math.max(...buttons.map(b => b.y)) + BTN + 20;
  // Grid más fino: cada 2px pero líneas visuales cada 10px
  const gridSize = 10;
  return (
    <div onClick={() => onSelect(null)} style={{
      position: "relative", width: W, height: H, flexShrink: 0,
      background: showGrid
        ? `repeating-linear-gradient(0deg,transparent,transparent ${gridSize-1}px,rgba(90,58,24,.25) ${gridSize}px),
           repeating-linear-gradient(90deg,transparent,transparent ${gridSize-1}px,rgba(90,58,24,.25) ${gridSize}px),
           #0e0701`
        : "#0e0701",
      border: "1px solid #2a1608", borderRadius: 10, touchAction: "none",
    }}>
      {buttons.map(btn => (
        <Key key={btn.id} btn={btn} mode={mode} selected={selected}
          onSelect={onSelect} onMove={onMove} nc={nc} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TABLA EDITABLE — nota abre, nota cierra, color individual
// ─────────────────────────────────────────────────────────────────
function NoteSelect({ value, onChange, field, nc }) {
  return (
    <select value={value} onChange={e => onChange(field, e.target.value)}
      onClick={e => e.stopPropagation()} style={{
        background: "#1a0e04", color: nc(value),
        border: `1px solid ${nc(value)}55`,
        borderRadius: 5, padding: "2px 3px",
        fontFamily: "'Courier New',monospace",
        fontWeight: 700, fontSize: 9, cursor: "pointer", width: 58,
      }}>
      {ALL_NOTES.map(n => (
        <option key={n} value={n} style={{ color: nc(n), background: "#1a0e04" }}>{n}</option>
      ))}
    </select>
  );
}

function Table({ buttons, mode, selected, onSelect, onEdit, nc }) {
  return (
    <div style={{
      overflowY: "auto", maxHeight: "calc(100vh - 260px)",
      border: "1px solid #2a1608", borderRadius: 8,
    }}>
      <table style={{
        borderCollapse: "collapse", fontSize: 9, width: "100%",
        fontFamily: "'Courier New',monospace",
      }}>
        <thead>
          <tr style={{ background: "#1a0e04", position: "sticky", top: 0, zIndex: 5 }}>
            {["ID","F","X","Y","▷ Abre","◁ Cierra","Color"].map(h => (
              <th key={h} style={{
                padding: "6px 6px", textAlign: "left", color: "#6a4020",
                letterSpacing: "0.06em", borderBottom: "1px solid #2a1608",
                whiteSpace: "nowrap",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {buttons.map(btn => {
            const isSel = btn.id === selected;
            const noteNow = mode === "abre" ? btn.abre : btn.cierra;
            const btnColor = btn.color || nc(noteNow);
            return (
              <tr key={btn.id} onClick={() => onSelect(btn.id)} style={{
                background: isSel ? "rgba(245,192,96,.09)" : "transparent",
                cursor: "pointer",
                borderBottom: "1px solid rgba(26,14,4,.6)",
                outline: isSel ? "1px solid rgba(245,192,96,.25)" : "none",
              }}>
                {/* ID */}
                <td style={{ padding: "3px 6px" }}>
                  <span style={{
                    display: "inline-block", width: 8, height: 8,
                    borderRadius: "50%", background: btnColor,
                    marginRight: 4, verticalAlign: "middle",
                  }}/>
                  <span style={{ color: btnColor, fontWeight: 700 }}>{btn.id}</span>
                </td>
                {/* Fila */}
                <td style={{ padding: "3px 6px", color: "#4a2e10" }}>F{btn.row + 1}</td>
                {/* X */}
                <td style={{ padding: "3px 6px", color: "#7a5030" }}>{btn.x}</td>
                {/* Y */}
                <td style={{ padding: "3px 6px", color: "#7a5030" }}>{btn.y}</td>
                {/* Abre */}
                <td style={{ padding: "2px 4px" }}>
                  <NoteSelect value={btn.abre} onChange={(f,v) => onEdit(btn.id,f,v)} field="abre" nc={nc}/>
                </td>
                {/* Cierra */}
                <td style={{ padding: "2px 4px" }}>
                  <NoteSelect value={btn.cierra} onChange={(f,v) => onEdit(btn.id,f,v)} field="cierra" nc={nc}/>
                </td>
                {/* Color individual del botón */}
                <td style={{ padding: "2px 4px" }} onClick={e => e.stopPropagation()}>
                  <input
                    type="color"
                    value={btn.color || btnColor}
                    onChange={e => onEdit(btn.id, "color", e.target.value)}
                    title="Color personalizado del botón"
                    style={{
                      width: 28, height: 22, padding: 1, borderRadius: 4,
                      border: "1px solid #3a2010", background: "#1a0e04",
                      cursor: "pointer",
                    }}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PANEL COLORES GLOBALES POR NOTA
// ─────────────────────────────────────────────────────────────────
function ColorPanel({ colors, setColor, onReset }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 8 }}>
      <button onClick={() => setOpen(p => !p)} style={{
        padding: "5px 12px", borderRadius: 8,
        border: "1px solid #3a2010", background: "#1a0e04",
        color: "#7a5030", fontFamily: "'Courier New',monospace",
        fontWeight: 700, fontSize: 10, cursor: "pointer",
      }}>
        🎨 {open ? "Ocultar" : "Colores por nota"}
      </button>
      {open && (
        <div style={{
          marginTop: 8, padding: "10px 12px",
          background: "#1a0e04", border: "1px solid #2a1608",
          borderRadius: 8, display: "flex", flexWrap: "wrap", gap: 8,
        }}>
          {ALL_NOTES.map(note => (
            <div key={note} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <input
                type="color"
                value={colors[note]}
                onChange={e => setColor(note, e.target.value)}
                style={{
                  width: 24, height: 20, padding: 1, borderRadius: 3,
                  border: `1px solid ${colors[note]}`,
                  background: "#0e0701", cursor: "pointer",
                }}
              />
              <span style={{
                fontSize: 9, color: colors[note],
                fontFamily: "'Courier New',monospace", fontWeight: 700,
              }}>{note}</span>
            </div>
          ))}
          <button onClick={onReset} style={{
            padding: "3px 10px", borderRadius: 6,
            border: "1px solid #3a2010", background: "#0e0701",
            color: "#6a4020", fontFamily: "monospace", fontSize: 9, cursor: "pointer",
          }}>⟳ Restaurar</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// EXPORT — CSV completo con color
// ─────────────────────────────────────────────────────────────────
function ExportPanel({ buttons, hand, nc }) {
  const [type,   setType]   = useState(null);
  const [copied, setCopied] = useState(false);

  const csvText = () => {
    const header = "id,row,x,y,abre,cierra,color";
    const rows = buttons.map(b => {
      const color = b.color || nc(b.abre);
      return `${b.id},${b.row},${b.x},${b.y},${b.abre},${b.cierra},${color}`;
    });
    return [header, ...rows].join("\n");
  };

  const jsText = () => {
    const name = hand === "left" ? "LEFT_HAND" : "RIGHT_HAND";
    const lines = buttons.map(b => {
      const color = b.color || nc(b.abre);
      return `  { id:"${b.id}", x:${b.x}, y:${b.y}, row:${b.row}, abre:"${b.abre}", cierra:"${b.cierra}", color:"${color}" },`;
    });
    return `const ${name} = [\n${lines.join("\n")}\n];`;
  };

  const text = type === "csv" ? csvText() : type === "js" ? jsText() : "";

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  };

  const bS = (active) => ({
    padding: "5px 12px", borderRadius: 7, border: "none",
    fontFamily: "'Courier New',monospace", fontWeight: 700, fontSize: 10,
    cursor: "pointer", transition: "all .2s",
    background: active ? "linear-gradient(135deg,#0d9488,#2dd4bf)" : "#1a0e04",
    color: active ? "#0a0502" : "#7a5030",
    border: active ? "none" : "1px solid #3a2010",
  });

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button style={bS(type === "csv")} onClick={() => setType(t => t === "csv" ? null : "csv")}>↓ CSV</button>
        <button style={bS(type === "js")}  onClick={() => setType(t => t === "js"  ? null : "js")}>↓ JS</button>
      </div>
      {type && (
        <div style={{ position: "relative", marginTop: 8 }}>
          <textarea readOnly value={text} style={{
            width: "100%", height: 130, background: "#080401", color: "#f5c060",
            border: "1px solid #3a2010", borderRadius: 8, padding: 10,
            fontSize: 8, fontFamily: "'Courier New',monospace",
            resize: "vertical", lineHeight: 1.5, boxSizing: "border-box",
          }}/>
          <button onClick={copy} style={{
            position: "absolute", top: 6, right: 6,
            padding: "3px 10px", borderRadius: 5,
            border: "1px solid #3a2010",
            background: copied ? "#0d9488" : "#1a0e04",
            color: copied ? "#fff" : "#7a5030",
            fontFamily: "monospace", fontSize: 9, cursor: "pointer",
          }}>{copied ? "✓ Copiado" : "Copiar"}</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// APP PRINCIPAL
// ─────────────────────────────────────────────────────────────────
export default function App() {
  const [hand,      setHand]      = useState("left");
  const [mode,      setMode]      = useState("abre");
  const [showGrid,  setShowGrid]  = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [leftBtns,  setLeftBtns]  = useState(() => DEFS_L.map(b => ({...b})));
  const [rightBtns, setRightBtns] = useState(() => DEFS_R.map(b => ({...b})));
  const { colors, nc, setColor }  = useNoteColors();

  const buttons    = hand === "left" ? leftBtns    : rightBtns;
  const setButtons = hand === "left" ? setLeftBtns : setRightBtns;
  const initDefs   = hand === "left" ? DEFS_L      : DEFS_R;

  const handleMove = useCallback((id, x, y) => {
    setButtons(prev => prev.map(b => b.id === id ? {...b, x, y} : b));
  }, [setButtons]);

  const handleEdit = useCallback((id, field, value) => {
    setButtons(prev => prev.map(b => b.id === id ? {...b, [field]: value} : b));
  }, [setButtons]);

  // Teclado — SNAP=2px, Shift=10px
  useEffect(() => {
    const handler = e => {
      if (!selected) return;
      const step = e.shiftKey ? 10 : SNAP;
      const dirs = { ArrowLeft:[-step,0], ArrowRight:[step,0], ArrowUp:[0,-step], ArrowDown:[0,step] };
      if (!dirs[e.key]) return;
      e.preventDefault();
      const [dx, dy] = dirs[e.key];
      setButtons(prev => prev.map(b =>
        b.id === selected ? {...b, x: Math.max(0,b.x+dx), y: Math.max(0,b.y+dy)} : b
      ));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, setButtons]);

  const selBtn = buttons.find(b => b.id === selected);

  const cBtn = (active, variant = "orange") => ({
    padding: "6px 13px", borderRadius: 8, border: "none",
    fontFamily: "'Courier New',monospace", fontWeight: 700, fontSize: 10,
    cursor: "pointer", transition: "all .2s",
    background: active
      ? variant === "orange"
        ? "linear-gradient(135deg,#a05010,#f5c060)"
        : "linear-gradient(135deg,#1a4a8a,#4a8af0)"
      : "transparent",
    color: active ? (variant === "orange" ? "#0a0502" : "#fff") : "#6a4020",
  });

  const rowCounts = {};
  buttons.forEach(b => { rowCounts[b.row] = (rowCounts[b.row] || 0) + 1; });

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% 0%,#1e0c03,#060301 70%)",
      padding: "14px 12px 40px",
      fontFamily: "'Courier New',monospace",
    }}>

      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <div style={{
          fontSize: 18, fontWeight: 900, color: "#f5c060",
          letterSpacing: "0.1em", textShadow: "0 0 20px rgba(245,192,96,.4)",
        }}>BANDONEÓN · EDITOR</div>
        <div style={{ fontSize: 8, color: "#5a3018", letterSpacing: "0.18em", marginTop: 1 }}>
          SNAP 2px · ARRASTRÁ · EDITÁ NOTAS Y COLORES · EXPORTÁ CSV
        </div>
      </div>

      {/* CONTROLES */}
      <div style={{ display:"flex", gap:7, justifyContent:"center", flexWrap:"wrap", marginBottom:10 }}>
        <div style={{ display:"flex", background:"#100802", border:"1.5px solid #3a2010", borderRadius:10, padding:3, gap:3 }}>
          <button style={cBtn(mode==="abre")}   onClick={()=>setMode("abre")}>▷ ABRIENDO</button>
          <button style={cBtn(mode==="cierra")} onClick={()=>setMode("cierra")}>◁ CERRANDO</button>
        </div>
        <div style={{ display:"flex", background:"#100802", border:"1.5px solid #3a2010", borderRadius:10, padding:3, gap:3 }}>
          <button style={cBtn(hand==="left","blue")}  onClick={()=>{setHand("left");  setSelected(null);}}>IZQ 33</button>
          <button style={cBtn(hand==="right","blue")} onClick={()=>{setHand("right"); setSelected(null);}}>DER 38</button>
        </div>
        <button onClick={()=>setShowGrid(p=>!p)} style={{
          padding:"6px 11px", borderRadius:10, border:"1.5px solid #3a2010",
          background:"#100802", color:showGrid?"#2DD4BF":"#6a4020",
          fontFamily:"'Courier New',monospace", fontWeight:700, fontSize:10, cursor:"pointer",
        }}>{showGrid ? "⊞ Grid ON" : "⊞ Grid"}</button>
        <button onClick={()=>{setButtons(initDefs.map(b=>({...b}))); setSelected(null);}} style={{
          padding:"6px 11px", borderRadius:10, border:"1.5px solid #3a2010",
          background:"#100802", color:"#7a5030",
          fontFamily:"'Courier New',monospace", fontWeight:700, fontSize:10, cursor:"pointer",
        }}>⟳ Reset</button>
      </div>

      {/* CONTEO FILAS */}
      <div style={{ display:"flex", gap:5, justifyContent:"center", flexWrap:"wrap", marginBottom:10 }}>
        {Object.entries(rowCounts).map(([row,cnt]) => (
          <span key={row} style={{
            fontSize:8, color:"#7a5030", fontFamily:"monospace",
            background:"#1a0e04", border:"1px solid #2a1608",
            borderRadius:4, padding:"1px 7px",
          }}>F{parseInt(row)+1}: {cnt}</span>
        ))}
        <span style={{ fontSize:8, color:"#3a6030", fontFamily:"monospace",
          background:"#0a1a04", border:"1px solid #1a3008",
          borderRadius:4, padding:"1px 7px",
        }}>SNAP: {SNAP}px · ⇧=10px</span>
      </div>

      {/* LAYOUT */}
      <div style={{ display:"flex", gap:12, maxWidth:1200, margin:"0 auto", flexWrap:"wrap" }}>

        {/* CANVAS */}
        <div style={{ flex:"1 1 420px", minWidth:340 }}>
          <div style={{ fontSize:10, fontWeight:800, color:"#f5c060", letterSpacing:"0.14em", marginBottom:6 }}>
            {hand==="left" ? "MANO IZQUIERDA · 33 botones" : "MANO DERECHA · 38 botones"}
          </div>
          <div style={{ fontSize:8, color:"#6a4020", background:"#1a0e04", border:"1px solid #2a1608",
            borderRadius:6, padding:"4px 9px", marginBottom:8, lineHeight:1.6 }}>
            🖱 Arrastrá · ⌨ Flechas 2px (Shift=10px) · 📱 Botones ← → ↑ ↓
          </div>

          {/* Colores globales por nota */}
          <ColorPanel
            colors={colors}
            setColor={setColor}
            onReset={() => Object.entries(DEFAULT_NOTE_COLORS).forEach(([n,c]) => setColor(n,c))}
          />

          <div style={{ overflowX:"auto", paddingBottom:6 }}>
            <Canvas buttons={buttons} mode={mode} selected={selected}
              onSelect={setSelected} onMove={handleMove} showGrid={showGrid} nc={nc}/>
          </div>

          {/* Info botón seleccionado */}
          {selBtn && (
            <div style={{
              display:"flex", gap:6, alignItems:"center", flexWrap:"wrap",
              background:"#1a0e04", border:"1px solid #3a2010",
              borderRadius:8, padding:"6px 10px", marginTop:8,
            }}>
              <span style={{ color:"#f5c060", fontWeight:700, fontSize:11 }}>{selBtn.id}</span>
              <span style={{ color:"#4a2e10", fontSize:9 }}>x:{selBtn.x} y:{selBtn.y}</span>
              <span style={{ fontSize:9, color: selBtn.color || nc(selBtn.abre) }}>▷ {selBtn.abre}</span>
              <span style={{ fontSize:9, color: selBtn.color || nc(selBtn.cierra) }}>◁ {selBtn.cierra}</span>
              <div style={{ marginLeft:"auto", display:"flex", gap:3 }}>
                {[["←",-SNAP,0],["→",SNAP,0],["↑",0,-SNAP],["↓",0,SNAP]].map(([l,dx,dy]) => (
                  <button key={l} onClick={() => setButtons(prev => prev.map(b =>
                    b.id===selected ? {...b, x:Math.max(0,b.x+dx), y:Math.max(0,b.y+dy)} : b
                  ))} style={{
                    width:28, height:28, borderRadius:6,
                    border:"1px solid #3a2010", background:"#100802",
                    color:"#f5c060", fontSize:13, cursor:"pointer", padding:0,
                  }}>{l}</button>
                ))}
              </div>
            </div>
          )}

          <ExportPanel buttons={buttons} hand={hand} nc={nc}/>
        </div>

        {/* TABLA */}
        <div style={{ flex:"0 0 340px", minWidth:300 }}>
          <div style={{ fontSize:10, fontWeight:800, color:"#f5c060", letterSpacing:"0.14em", marginBottom:6 }}>
            TABLA · NOTAS Y COLORES
          </div>
          <div style={{ fontSize:8, color:"#6a4020", background:"#1a0e04", border:"1px solid #2a1608",
            borderRadius:6, padding:"4px 9px", marginBottom:8, lineHeight:1.6 }}>
            Clic en fila → selecciona · Desplegable → nota · 🎨 → color del botón
          </div>
          <Table
            buttons={buttons} mode={mode} selected={selected}
            onSelect={setSelected} onEdit={handleEdit} nc={nc}
          />
        </div>
      </div>
    </div>
  );
}
