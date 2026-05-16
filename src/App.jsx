import { useState, useRef, useCallback, useEffect } from "react";

// ─────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────
const ALL_NOTES = ["DO","DO#","RE","RE#","MI","FA","FA#","SOL","SOL#","LA","LA#","SI"];

function nc(n) {
  const m = {
    "DO":"#ef4444","DO#":"#f97316","RE":"#eab308","RE#":"#84cc16",
    "MI":"#22c55e","FA":"#14b8a6","FA#":"#06b6d4","SOL":"#3b82f6",
    "SOL#":"#6366f1","LA":"#8b5cf6","LA#":"#d946ef","SI":"#ec4899",
  };
  return m[n] || "#94a3b8";
}

const SNAP = 6;
function snapV(v) { return Math.round(v / SNAP) * SNAP; }

// ─────────────────────────────────────────────────────────────────
// COORDENADAS AJUSTADAS A LAS FOTOS REALES
//
// Mano izquierda (foto IMG_20260516_141501.jpg):
// El cluster de botones ocupa aprox la mitad izquierda de la tapa.
// Visto desde fuera → botones en forma de rombo/diamante.
//   Fila 0 (exterior/arriba): 5 botones — la fila más alta y centrada
//   Fila 1 (intercalada):     7 botones — se expande hacia ambos lados
//   Fila 2:                   6 botones
//   Fila 3 (intercalada):     7 botones
//   Fila 4 (interior/abajo):  8 botones — la fila más baja y ancha
//
// BTN = 44px, espacio entre centros ~52px horizontal, ~52px vertical
// El conjunto tiene forma de diamante: más ancho en el medio (F2/F3)
// ─────────────────────────────────────────────────────────────────

const BTN = 44;

// Coordenadas x,y del CENTRO de cada botón, ajustadas a la foto real.
// Origin (0,0) = esquina superior izquierda del canvas.
// La forma general es un rombo inclinado, más ancho abajo.

const DEFS_L = [
  // Fila 0 — 5 botones — fila exterior (arriba del instrumento)
  // En la foto: 5 botones en fila alta, levemente descentrados a la derecha
  { id:"L01", row:0, x: 82, y:  14, abre:"SOL#", cierra:"SOL#" },
  { id:"L02", row:0, x:134, y:  14, abre:"LA#",  cierra:"LA#"  },
  { id:"L03", row:0, x:186, y:  14, abre:"DO#",  cierra:"RE#"  },
  { id:"L04", row:0, x:238, y:  14, abre:"FA",   cierra:"RE#"  },
  { id:"L05", row:0, x:290, y:  14, abre:"SOL#", cierra:"SOL"  },

  // Fila 1 — 7 botones — intercalada, se expande a la izquierda
  { id:"L06", row:1, x:  4, y:  66, abre:"LA",   cierra:"RE"   },
  { id:"L07", row:1, x: 56, y:  66, abre:"LA",   cierra:"SOL"  },
  { id:"L08", row:1, x:108, y:  66, abre:"DO",   cierra:"LA#"  },
  { id:"L09", row:1, x:160, y:  66, abre:"MI",   cierra:"SI"   },
  { id:"L10", row:1, x:212, y:  66, abre:"SOL",  cierra:"RE"   },
  { id:"L11", row:1, x:264, y:  66, abre:"DO",   cierra:"FA"   },
  { id:"L12", row:1, x:316, y:  66, abre:"FA",   cierra:"SOL"  },

  // Fila 2 — 6 botones
  { id:"L13", row:2, x: 30, y: 118, abre:"RE",   cierra:"MI"   },
  { id:"L14", row:2, x: 82, y: 118, abre:"SOL",  cierra:"LA"   },
  { id:"L15", row:2, x:134, y: 118, abre:"SI",   cierra:"DO"   },
  { id:"L16", row:2, x:186, y: 118, abre:"RE",   cierra:"FA#"  },
  { id:"L17", row:2, x:238, y: 118, abre:"FA#",  cierra:"DO#"  },
  { id:"L18", row:2, x:290, y: 118, abre:"DO#",  cierra:"FA#"  },

  // Fila 3 — 7 botones — intercalada, se expande más
  { id:"L19", row:3, x:  4, y: 170, abre:"MI",   cierra:"SOL#" },
  { id:"L20", row:3, x: 56, y: 170, abre:"SOL#", cierra:"SOL"  },
  { id:"L21", row:3, x:108, y: 170, abre:"SOL",  cierra:"LA"   },
  { id:"L22", row:3, x:160, y: 170, abre:"LA",   cierra:"RE#"  },
  { id:"L23", row:3, x:212, y: 170, abre:"RE#",  cierra:"FA#"  },
  { id:"L24", row:3, x:264, y: 170, abre:"FA#",  cierra:"SOL#" },
  { id:"L25", row:3, x:316, y: 170, abre:"FA#",  cierra:"SI"   },

  // Fila 4 — 8 botones — interior (más cerca del cuerpo), la más ancha
  { id:"L26", row:4, x:  4, y: 222, abre:"RE",   cierra:"MI"   },
  { id:"L27", row:4, x: 56, y: 222, abre:"SI",   cierra:"SI"   },
  { id:"L28", row:4, x:108, y: 222, abre:"MI",   cierra:"SOL"  },
  { id:"L29", row:4, x:160, y: 222, abre:"LA",   cierra:"LA"   },
  { id:"L30", row:4, x:212, y: 222, abre:"RE#",  cierra:"SI"   },
  { id:"L31", row:4, x:264, y: 222, abre:"FA#",  cierra:"FA"   },
  { id:"L32", row:4, x:316, y: 222, abre:"RE#",  cierra:"DO#"  },
  { id:"L33", row:4, x:368, y: 222, abre:"DO",   cierra:"FA"   },
];

// ─────────────────────────────────────────────────────────────────
// Mano derecha (foto IMG_20260516_141445.jpg lado derecho):
// 38 botones, mismo patrón de diamante pero espejado y más grande.
// La foto muestra los botones en la mitad derecha de esa tapa.
// Forma: más estrecha arriba, se ensancha hacia abajo.
// ─────────────────────────────────────────────────────────────────
const DEFS_R = [
  // Fila 0 — 7 botones — exterior
  { id:"R01", row:0, x:  4, y:  14, abre:"SI",   cierra:"SI"   },
  { id:"R02", row:0, x: 56, y:  14, abre:"SOL#", cierra:"SOL#" },
  { id:"R03", row:0, x:108, y:  14, abre:"SOL",  cierra:"SOL#" },
  { id:"R04", row:0, x:160, y:  14, abre:"SOL",  cierra:"SOL"  },
  { id:"R05", row:0, x:212, y:  14, abre:"LA",   cierra:"SOL"  },
  { id:"R06", row:0, x:264, y:  14, abre:"FA",   cierra:"FA"   },
  { id:"R07", row:0, x:316, y:  14, abre:"FA",   cierra:"RE#"  },

  // Fila 1 — 8 botones
  { id:"R08", row:1, x:  4, y:  66, abre:"DO",   cierra:"LA"   },
  { id:"R09", row:1, x: 56, y:  66, abre:"RE",   cierra:"FA#"  },
  { id:"R10", row:1, x:108, y:  66, abre:"SOL",  cierra:"MI"   },
  { id:"R11", row:1, x:160, y:  66, abre:"FA#",  cierra:"LA"   },
  { id:"R12", row:1, x:212, y:  66, abre:"LA#",  cierra:"DO"   },
  { id:"R13", row:1, x:264, y:  66, abre:"DO",   cierra:"RE#"  },
  { id:"R14", row:1, x:316, y:  66, abre:"RE#",  cierra:"MI"   },
  { id:"R15", row:1, x:368, y:  66, abre:"MI",   cierra:"RE#"  },

  // Fila 2 — 9 botones — la más ancha
  { id:"R16", row:2, x:  4, y: 118, abre:"SI",   cierra:"DO"   },
  { id:"R17", row:2, x: 56, y: 118, abre:"MI",   cierra:"DO#"  },
  { id:"R18", row:2, x:108, y: 118, abre:"DO#",  cierra:"FA#"  },
  { id:"R19", row:2, x:160, y: 118, abre:"FA#",  cierra:"SI"   },
  { id:"R20", row:2, x:212, y: 118, abre:"LA",   cierra:"RE"   },
  { id:"R21", row:2, x:264, y: 118, abre:"RE#",  cierra:"FA#"  },
  { id:"R22", row:2, x:316, y: 118, abre:"FA#",  cierra:"LA"   },
  { id:"R23", row:2, x:368, y: 118, abre:"LA",   cierra:"RE"   },
  { id:"R24", row:2, x:420, y: 118, abre:"RE",   cierra:"SOL#" },

  // Fila 3 — 8 botones
  { id:"R25", row:3, x:  4, y: 170, abre:"FA",   cierra:"LA"   },
  { id:"R26", row:3, x: 56, y: 170, abre:"LA",   cierra:"RE#"  },
  { id:"R27", row:3, x:108, y: 170, abre:"RE#",  cierra:"FA#"  },
  { id:"R28", row:3, x:160, y: 170, abre:"FA#",  cierra:"RE#"  },
  { id:"R29", row:3, x:212, y: 170, abre:"RE#",  cierra:"FA#"  },
  { id:"R30", row:3, x:264, y: 170, abre:"FA#",  cierra:"LA"   },
  { id:"R31", row:3, x:316, y: 170, abre:"LA",   cierra:"DO"   },
  { id:"R32", row:3, x:368, y: 170, abre:"SOL#", cierra:"SI"   },

  // Fila 4 — 6 botones — interior
  { id:"R33", row:4, x: 56, y: 222, abre:"DO",   cierra:"SI"   },
  { id:"R34", row:4, x:108, y: 222, abre:"LA",   cierra:"LA#"  },
  { id:"R35", row:4, x:160, y: 222, abre:"DO",   cierra:"DO"   },
  { id:"R36", row:4, x:212, y: 222, abre:"MI",   cierra:"MI"   },
  { id:"R37", row:4, x:264, y: 222, abre:"SOL#", cierra:"SOL"  },
  { id:"R38", row:4, x:316, y: 222, abre:"RE#",  cierra:"RE#"  },
];

// ─────────────────────────────────────────────────────────────────
// BOTÓN DRAGGABLE
// ─────────────────────────────────────────────────────────────────
function Key({ btn, mode, selected, onSelect, onMove }) {
  const note  = mode === "abre" ? btn.abre : btn.cierra;
  const color = nc(note);
  const isSel = selected === btn.id;

  const onMouseDown = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    onSelect(btn.id);
    const ox = e.clientX - btn.x;
    const oy = e.clientY - btn.y;
    const move = (e2) => onMove(btn.id, snapV(Math.max(0,e2.clientX-ox)), snapV(Math.max(0,e2.clientY-oy)));
    const up   = () => { window.removeEventListener("mousemove",move); window.removeEventListener("mouseup",up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }, [btn, onSelect, onMove]);

  const onTouchStart = useCallback((e) => {
    e.stopPropagation();
    onSelect(btn.id);
    const t  = e.touches[0];
    const ox = t.clientX - btn.x;
    const oy = t.clientY - btn.y;
    const move = (e2) => { e2.preventDefault(); const t2=e2.touches[0]; onMove(btn.id, snapV(Math.max(0,t2.clientX-ox)), snapV(Math.max(0,t2.clientY-oy))); };
    const up   = () => { window.removeEventListener("touchmove",move); window.removeEventListener("touchend",up); };
    window.addEventListener("touchmove", move, { passive:false });
    window.addEventListener("touchend", up);
  }, [btn, onSelect, onMove]);

  return (
    <div onMouseDown={onMouseDown} onTouchStart={onTouchStart} style={{
      position:"absolute", left:btn.x, top:btn.y,
      width:BTN, height:BTN, borderRadius:"50%",
      cursor:"grab", touchAction:"none", userSelect:"none",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      zIndex: isSel ? 100 : 10,
      background: isSel
        ? `radial-gradient(circle at 36% 30%,${color}ff,${color}aa 55%,${color}66)`
        : `radial-gradient(circle at 36% 30%,${color}55,${color}22 60%,${color}11)`,
      border: `2px solid ${isSel ? color : color+"77"}`,
      boxShadow: isSel ? `0 0 18px ${color}cc,0 0 36px ${color}44` : "0 2px 8px rgba(0,0,0,.7)",
      transition:"box-shadow .12s",
    }}>
      <div style={{
        position:"absolute", top:5, left:9, width:11, height:7,
        borderRadius:"50%", background:"rgba(255,255,255,.18)",
        filter:"blur(1px)", pointerEvents:"none",
      }}/>
      <span style={{
        fontSize: note.length>2 ? 7.5 : 9.5, fontWeight:800,
        color: isSel ? "#fff" : color,
        fontFamily:"'Courier New',monospace", lineHeight:1, zIndex:1,
        textShadow: isSel ? "0 1px 4px rgba(0,0,0,.9)" : "none",
      }}>{note}</span>
      <span style={{
        fontSize:6.5, fontFamily:"monospace", lineHeight:1, zIndex:1,
        color: isSel ? "rgba(255,255,255,.75)" : color+"88",
      }}>{btn.id}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// CANVAS
// ─────────────────────────────────────────────────────────────────
function Canvas({ buttons, mode, selected, onSelect, onMove, showGrid }) {
  const W = Math.max(...buttons.map(b=>b.x)) + BTN + 20;
  const H = Math.max(...buttons.map(b=>b.y)) + BTN + 16;
  return (
    <div onClick={()=>onSelect(null)} style={{
      position:"relative", width:W, height:H, flexShrink:0,
      background: showGrid
        ? `repeating-linear-gradient(0deg,transparent,transparent 51px,rgba(90,58,24,.2) 52px),
           repeating-linear-gradient(90deg,transparent,transparent 51px,rgba(90,58,24,.2) 52px),#0e0701`
        : "#0e0701",
      border:"1px solid #2a1608", borderRadius:10, touchAction:"none",
    }}>
      {[0,1,2,3,4].map(row=>(
        <div key={row} style={{
          position:"absolute", left:0, right:0,
          top: buttons.filter(b=>b.row===row)[0]?.y + BTN/2,
          height:1, background:"rgba(90,58,24,.18)", pointerEvents:"none",
        }}/>
      ))}
      {buttons.map(btn=>(
        <Key key={btn.id} btn={btn} mode={mode} selected={selected} onSelect={onSelect} onMove={onMove}/>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// TABLA CON EDICIÓN DE NOTAS INLINE
// ─────────────────────────────────────────────────────────────────
function NoteSelect({ value, onChange, field }) {
  return (
    <select
      value={value}
      onChange={e => onChange(field, e.target.value)}
      onClick={e => e.stopPropagation()}
      style={{
        background:"#1a0e04", color: nc(value),
        border:`1px solid ${nc(value)}55`,
        borderRadius:5, padding:"2px 4px",
        fontFamily:"'Courier New',monospace",
        fontWeight:700, fontSize:9, cursor:"pointer",
        width:60,
      }}
    >
      {ALL_NOTES.map(n=>(
        <option key={n} value={n} style={{ color:nc(n), background:"#1a0e04" }}>{n}</option>
      ))}
    </select>
  );
}

function Table({ buttons, mode, selected, onSelect, onEdit }) {
  return (
    <div style={{
      overflowY:"auto", maxHeight:"calc(100vh - 280px)",
      border:"1px solid #2a1608", borderRadius:8,
    }}>
      <table style={{
        borderCollapse:"collapse", fontSize:9, width:"100%",
        fontFamily:"'Courier New',monospace",
      }}>
        <thead>
          <tr style={{ background:"#1a0e04", position:"sticky", top:0, zIndex:5 }}>
            {["ID","F","X","Y","▷ Abre","◁ Cierra"].map(h=>(
              <th key={h} style={{
                padding:"6px 8px", textAlign:"left", color:"#6a4020",
                letterSpacing:"0.08em", borderBottom:"1px solid #2a1608",
                whiteSpace:"nowrap",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {buttons.map(btn => {
            const isSel = btn.id === selected;
            const noteNow = mode==="abre" ? btn.abre : btn.cierra;
            return (
              <tr key={btn.id} onClick={()=>onSelect(btn.id)} style={{
                background: isSel ? "rgba(245,192,96,.09)" : "transparent",
                cursor:"pointer",
                borderBottom:"1px solid rgba(26,14,4,.6)",
                outline: isSel ? "1px solid rgba(245,192,96,.2)" : "none",
              }}>
                <td style={{ padding:"4px 8px", color:nc(noteNow), fontWeight:700 }}>{btn.id}</td>
                <td style={{ padding:"4px 8px", color:"#4a2e10" }}>F{btn.row+1}</td>
                <td style={{ padding:"4px 8px", color:"#7a5030" }}>{btn.x}</td>
                <td style={{ padding:"4px 8px", color:"#7a5030" }}>{btn.y}</td>
                <td style={{ padding:"3px 6px" }}>
                  <NoteSelect value={btn.abre}   onChange={(f,v)=>onEdit(btn.id,f,v)} field="abre"   />
                </td>
                <td style={{ padding:"3px 6px" }}>
                  <NoteSelect value={btn.cierra} onChange={(f,v)=>onEdit(btn.id,f,v)} field="cierra" />
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
// EXPORT
// ─────────────────────────────────────────────────────────────────
function ExportPanel({ buttons, hand }) {
  const [type,   setType]   = useState(null);
  const [copied, setCopied] = useState(false);

  const jsText = () => {
    const name = hand==="left" ? "LEFT_HAND" : "RIGHT_HAND";
    const lines = buttons.map(b=>
      `  { id:"${b.id}", x:${b.x}, y:${b.y}, row:${b.row}, abre:"${b.abre}", cierra:"${b.cierra}" },`
    );
    return `const ${name} = [\n${lines.join("\n")}\n];`;
  };
  const csvText = () => {
    const h = "id,row,x,y,abre,cierra";
    const r = buttons.map(b=>`${b.id},${b.row},${b.x},${b.y},${b.abre},${b.cierra}`);
    return [h,...r].join("\n");
  };

  const text = type==="js" ? jsText() : type==="csv" ? csvText() : "";

  const copy = () => {
    navigator.clipboard.writeText(text).then(()=>{
      setCopied(true); setTimeout(()=>setCopied(false),2000);
    });
  };

  const btnS = (active) => ({
    padding:"5px 12px", borderRadius:7, border:"none",
    fontFamily:"'Courier New',monospace", fontWeight:700, fontSize:10,
    cursor:"pointer", transition:"all .2s",
    background: active ? "linear-gradient(135deg,#0d9488,#2dd4bf)" : "#1a0e04",
    color: active ? "#0a0502" : "#7a5030",
    border: active ? "none" : "1px solid #3a2010",
  });

  return (
    <div style={{ marginTop:10 }}>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        <button style={btnS(type==="js")}  onClick={()=>setType(t=>t==="js"  ? null:"js")}>↓ Exportar JS</button>
        <button style={btnS(type==="csv")} onClick={()=>setType(t=>t==="csv" ? null:"csv")}>↓ Exportar CSV</button>
      </div>
      {type && (
        <div style={{ position:"relative", marginTop:8 }}>
          <textarea readOnly value={text} style={{
            width:"100%", height:120, background:"#080401", color:"#f5c060",
            border:"1px solid #3a2010", borderRadius:8, padding:10,
            fontSize:8, fontFamily:"'Courier New',monospace",
            resize:"vertical", lineHeight:1.5, boxSizing:"border-box",
          }}/>
          <button onClick={copy} style={{
            position:"absolute", top:6, right:6,
            padding:"3px 10px", borderRadius:5,
            border:"1px solid #3a2010",
            background: copied ? "#0d9488" : "#1a0e04",
            color: copied ? "#fff" : "#7a5030",
            fontFamily:"monospace", fontSize:9, cursor:"pointer",
          }}>{copied ? "✓ Copiado" : "Copiar"}</button>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────────
export default function App() {
  const [hand,      setHand]      = useState("left");
  const [mode,      setMode]      = useState("abre");
  const [showGrid,  setShowGrid]  = useState(false);
  const [selected,  setSelected]  = useState(null);
  const [leftBtns,  setLeftBtns]  = useState(()=>DEFS_L.map(b=>({...b})));
  const [rightBtns, setRightBtns] = useState(()=>DEFS_R.map(b=>({...b})));

  const buttons    = hand==="left" ? leftBtns    : rightBtns;
  const setButtons = hand==="left" ? setLeftBtns : setRightBtns;
  const initDefs   = hand==="left" ? DEFS_L      : DEFS_R;

  const handleMove = useCallback((id,x,y) => {
    setButtons(prev=>prev.map(b=>b.id===id ? {...b,x,y} : b));
  },[setButtons]);

  const handleEdit = useCallback((id,field,value) => {
    setButtons(prev=>prev.map(b=>b.id===id ? {...b,[field]:value} : b));
  },[setButtons]);

  // Teclado
  useEffect(()=>{
    const handler = e => {
      if (!selected) return;
      const step = e.shiftKey ? SNAP*4 : SNAP;
      const dirs = { ArrowLeft:[-step,0], ArrowRight:[step,0], ArrowUp:[0,-step], ArrowDown:[0,step] };
      if (!dirs[e.key]) return;
      e.preventDefault();
      const [dx,dy] = dirs[e.key];
      setButtons(prev=>prev.map(b=>
        b.id===selected ? {...b, x:Math.max(0,b.x+dx), y:Math.max(0,b.y+dy)} : b
      ));
    };
    window.addEventListener("keydown", handler);
    return ()=>window.removeEventListener("keydown", handler);
  },[selected,setButtons]);

  const selBtn = buttons.find(b=>b.id===selected);

  const cBtn = (active, variant="orange") => ({
    padding:"6px 14px", borderRadius:8, border:"none",
    fontFamily:"'Courier New',monospace", fontWeight:700, fontSize:10,
    cursor:"pointer", transition:"all .2s",
    background: active
      ? variant==="orange" ? "linear-gradient(135deg,#a05010,#f5c060)"
                           : "linear-gradient(135deg,#1a4a8a,#4a8af0)"
      : "transparent",
    color: active ? (variant==="orange" ? "#0a0502" : "#fff") : "#6a4020",
  });

  const rowCounts = {};
  buttons.forEach(b=>{ rowCounts[b.row]=(rowCounts[b.row]||0)+1; });

  return (
    <div style={{
      minHeight:"100vh",
      background:"radial-gradient(ellipse at 50% 0%,#1e0c03,#060301 70%)",
      padding:"14px 12px 40px",
      fontFamily:"'Courier New',monospace",
    }}>

      {/* HEADER */}
      <div style={{ textAlign:"center", marginBottom:12 }}>
        <div style={{
          fontSize:18, fontWeight:900, color:"#f5c060",
          letterSpacing:"0.1em", textShadow:"0 0 20px rgba(245,192,96,.4)",
        }}>BANDONEÓN · EDITOR</div>
        <div style={{ fontSize:8, color:"#5a3018", letterSpacing:"0.18em", marginTop:1 }}>
          ARRASTRÁ · EDITÁ NOTAS EN LA TABLA · EXPORTÁ
        </div>
      </div>

      {/* CONTROLES */}
      <div style={{ display:"flex", gap:7, justifyContent:"center", flexWrap:"wrap", marginBottom:12 }}>
        <div style={{ display:"flex", background:"#100802", border:"1.5px solid #3a2010", borderRadius:10, padding:3, gap:3 }}>
          <button style={cBtn(mode==="abre")}   onClick={()=>setMode("abre")}>▷ ABRIENDO</button>
          <button style={cBtn(mode==="cierra")} onClick={()=>setMode("cierra")}>◁ CERRANDO</button>
        </div>
        <div style={{ display:"flex", background:"#100802", border:"1.5px solid #3a2010", borderRadius:10, padding:3, gap:3 }}>
          <button style={cBtn(hand==="left","blue")}  onClick={()=>{ setHand("left");  setSelected(null); }}>
            IZQ · 33btn
          </button>
          <button style={cBtn(hand==="right","blue")} onClick={()=>{ setHand("right"); setSelected(null); }}>
            DER · 38btn
          </button>
        </div>
        <button onClick={()=>setShowGrid(p=>!p)} style={{
          padding:"6px 12px", borderRadius:10, border:"1.5px solid #3a2010",
          background:"#100802", color:showGrid?"#2DD4BF":"#6a4020",
          fontFamily:"'Courier New',monospace", fontWeight:700, fontSize:10, cursor:"pointer",
        }}>{showGrid?"⊞ Grid ON":"⊞ Grid"}</button>
        <button onClick={()=>{ setButtons(initDefs.map(b=>({...b}))); setSelected(null); }} style={{
          padding:"6px 12px", borderRadius:10, border:"1.5px solid #3a2010",
          background:"#100802", color:"#7a5030",
          fontFamily:"'Courier New',monospace", fontWeight:700, fontSize:10, cursor:"pointer",
        }}>⟳ Reset</button>
      </div>

      {/* INFO FILA */}
      <div style={{ display:"flex", gap:5, justifyContent:"center", flexWrap:"wrap", marginBottom:12 }}>
        {Object.entries(rowCounts).map(([row,cnt])=>(
          <span key={row} style={{
            fontSize:8, color:"#7a5030", fontFamily:"monospace",
            background:"#1a0e04", border:"1px solid #2a1608",
            borderRadius:4, padding:"1px 7px",
          }}>F{parseInt(row)+1}: {cnt} btn</span>
        ))}
      </div>

      {/* LAYOUT PRINCIPAL */}
      <div style={{ display:"flex", gap:12, maxWidth:1100, margin:"0 auto", flexWrap:"wrap" }}>

        {/* CANVAS + info */}
        <div style={{ flex:"1 1 380px", minWidth:320 }}>
          <div style={{
            fontSize:10, fontWeight:800, color:"#f5c060",
            letterSpacing:"0.14em", marginBottom:6,
          }}>
            {hand==="left" ? "MANO IZQUIERDA · 33 botones" : "MANO DERECHA · 38 botones"}
          </div>
          <div style={{
            fontSize:8, color:"#6a4020", background:"#1a0e04",
            border:"1px solid #2a1608", borderRadius:6,
            padding:"4px 9px", marginBottom:8, lineHeight:1.6,
          }}>
            🖱 Arrastrá · ⌨ Flechas (Shift = paso grande) · 📱 Tocá → ← → ↑ ↓
          </div>

          <div style={{ overflowX:"auto", paddingBottom:6 }}>
            <Canvas buttons={buttons} mode={mode} selected={selected}
              onSelect={setSelected} onMove={handleMove} showGrid={showGrid}/>
          </div>

          {/* Botón seleccionado */}
          {selBtn && (
            <div style={{
              display:"flex", gap:6, alignItems:"center", flexWrap:"wrap",
              background:"#1a0e04", border:"1px solid #3a2010",
              borderRadius:8, padding:"6px 10px", marginTop:8,
            }}>
              <span style={{ color:"#f5c060", fontWeight:700, fontSize:11 }}>{selBtn.id}</span>
              <span style={{ color:"#4a2e10", fontSize:9 }}>x:{selBtn.x} y:{selBtn.y}</span>
              <span style={{ fontSize:9 }}>
                <span style={{color:"#5a3018"}}>▷ </span>
                <span style={{color:nc(selBtn.abre)}}>{selBtn.abre}</span>
              </span>
              <span style={{ fontSize:9 }}>
                <span style={{color:"#5a3018"}}>◁ </span>
                <span style={{color:nc(selBtn.cierra)}}>{selBtn.cierra}</span>
              </span>
              <div style={{ marginLeft:"auto", display:"flex", gap:3 }}>
                {[["←",-SNAP,0],["→",SNAP,0],["↑",0,-SNAP],["↓",0,SNAP]].map(([l,dx,dy])=>(
                  <button key={l} onClick={()=>setButtons(prev=>prev.map(b=>
                    b.id===selected ? {...b,x:Math.max(0,b.x+dx),y:Math.max(0,b.y+dy)} : b
                  ))} style={{
                    width:26,height:26,borderRadius:6,
                    border:"1px solid #3a2010",background:"#100802",
                    color:"#f5c060",fontSize:12,cursor:"pointer",padding:0,
                  }}>{l}</button>
                ))}
              </div>
            </div>
          )}

          <ExportPanel buttons={buttons} hand={hand}/>
        </div>

        {/* TABLA EDITABLE */}
        <div style={{ flex:"0 0 300px", minWidth:260 }}>
          <div style={{
            fontSize:10, fontWeight:800, color:"#f5c060",
            letterSpacing:"0.14em", marginBottom:6,
          }}>TABLA · EDICIÓN DE NOTAS</div>
          <div style={{
            fontSize:8, color:"#6a4020", background:"#1a0e04",
            border:"1px solid #2a1608", borderRadius:6,
            padding:"4px 9px", marginBottom:8, lineHeight:1.6,
          }}>
            Clic en fila → selecciona botón · Desplegable → cambia la nota
          </div>
          <Table
            buttons={buttons} mode={mode}
            selected={selected} onSelect={setSelected}
            onEdit={handleEdit}
          />
        </div>
      </div>
    </div>
  );
}
