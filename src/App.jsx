import { useState, useRef, useCallback, useEffect } from "react";

// ─── UTILS ────────────────────────────────────────────────────────
function toES(n) {
  const map = {
    "C":"DO","C#":"DO#","Db":"DO#","D":"RE","D#":"RE#","Eb":"RE#",
    "E":"MI","F":"FA","F#":"FA#","Gb":"FA#","G":"SOL","G#":"SOL#",
    "Ab":"SOL#","A":"LA","A#":"LA#","Bb":"LA#","B":"SI",
  };
  return map[n] || n;
}
function nc(n) {
  const m = {
    "DO":"#ef4444","DO#":"#f97316","RE":"#eab308","RE#":"#84cc16",
    "MI":"#22c55e","FA":"#14b8a6","FA#":"#06b6d4","SOL":"#3b82f6",
    "SOL#":"#6366f1","LA":"#8b5cf6","LA#":"#d946ef","SI":"#ec4899",
  };
  return m[n] || "#94a3b8";
}

// ─── CONSTANTES ───────────────────────────────────────────────────
const BTN   = 44;
const STEP  = 27;
const ROW_H = 52;
const SNAP  = 13;

function snapV(v) { return Math.round(v / SNAP) * SNAP; }

// ─── DATOS ────────────────────────────────────────────────────────
function make(defs) {
  return defs.map(([id, row, col, a, c]) => ({
    id, row, x: col * STEP, y: row * ROW_H,
    abre: toES(a), cierra: toES(c),
  }));
}

const DEFS_L = [
  ["L01",0, 4,"G#","G#"],["L02",0, 6,"Bb","Bb"],["L03",0, 8,"C#","Eb"],
  ["L04",0,10,"F","Eb"], ["L05",0,12,"G#","G"],
  ["L06",1, 1,"E","D"],  ["L07",1, 3,"A","D"],  ["L08",1, 5,"G","Bb"],
  ["L09",1, 7,"Eb","C"], ["L10",1, 9,"F","C#"], ["L11",1,11,"Bb","C"],
  ["L12",1,13,"F","F#"],
  ["L13",2, 2,"D","G"],  ["L14",2, 4,"A","G"],  ["L15",2, 6,"C","B"],
  ["L16",2, 8,"E","D"],  ["L17",2,10,"C","F"],  ["L18",2,12,"G","F#"],
  ["L19",3, 1,"E","A"],  ["L20",3, 3,"G#","E"], ["L21",3, 5,"B","A"],
  ["L22",3, 7,"D","C#"], ["L23",3, 9,"F#","E"], ["L24",3,11,"D#","G#"],
  ["L25",3,13,"F#","B"],
  ["L26",4, 0,"D","E"],  ["L27",4, 2,"B","E"],  ["L28",4, 4,"G","F#"],
  ["L29",4, 6,"A","G#"], ["L30",4, 8,"Eb","B"],
  ["L31",4,10,"F#","F"], ["L32",4,12,"Eb","C#"],["L33",4,14,"C","F"],
];

const DEFS_R = [
  ["R01",0, 0,"B","B"],  ["R02",0, 2,"G#","G#"],["R03",0, 4,"G","G#"],
  ["R04",0, 6,"G","G"],  ["R05",0, 8,"A","G"],  ["R06",0,10,"F","F"],
  ["R07",0,12,"F","Eb"],
  ["R08",1, 1,"C","A"],  ["R09",1, 3,"D","F#"], ["R10",1, 5,"G","E"],
  ["R11",1, 7,"F#","A"], ["R12",1, 9,"Bb","C"], ["R13",1,11,"C","Eb"],
  ["R14",1,13,"Eb","E"], ["R15",1,15,"E","Eb"],
  ["R16",2, 0,"B","C"],  ["R17",2, 2,"E","C#"], ["R18",2, 4,"C#","F#"],
  ["R19",2, 6,"F#","B"], ["R20",2, 8,"A","D"],  ["R21",2,10,"Eb","F#"],
  ["R22",2,12,"F#","A"], ["R23",2,14,"A","D"],  ["R24",2,16,"D","G#"],
  ["R25",3, 1,"F","A"],  ["R26",3, 3,"A","Eb"], ["R27",3, 5,"Eb","F#"],
  ["R28",3, 7,"F#","Eb"],["R29",3, 9,"Eb","F#"],["R30",3,11,"F#","A"],
  ["R31",3,13,"A","C"],  ["R32",3,15,"G#","B"],
  ["R33",4, 0,"C","B"],  ["R34",4, 2,"A","Bb"], ["R35",4, 4,"C","C"],
  ["R36",4, 6,"E","E"],  ["R37",4, 8,"G#","G"], ["R38",4,10,"Eb","Eb"],
];

// ─── BOTÓN DRAGGABLE ──────────────────────────────────────────────
function Key({ btn, mode, selected, onSelect, onMove }) {
  const note  = mode === "abre" ? btn.abre : btn.cierra;
  const color = nc(note);
  const isSel = selected === btn.id;

  const startRef = useRef(null);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(btn.id);
    const ox = e.clientX - btn.x;
    const oy = e.clientY - btn.y;
    startRef.current = { ox, oy };

    const move = (e2) => {
      onMove(btn.id,
        snapV(Math.max(0, e2.clientX - ox)),
        snapV(Math.max(0, e2.clientY - oy))
      );
    };
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
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      style={{
        position: "absolute",
        left: btn.x, top: btn.y,
        width: BTN, height: BTN,
        borderRadius: "50%",
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        zIndex: isSel ? 100 : 10,
        transition: "box-shadow .12s",
        background: isSel
          ? `radial-gradient(circle at 36% 30%,${color}ff,${color}aa 55%,${color}66)`
          : `radial-gradient(circle at 36% 30%,${color}55,${color}22 60%,${color}11)`,
        border: `2px solid ${isSel ? color : color + "77"}`,
        boxShadow: isSel
          ? `0 0 18px ${color}cc, 0 0 36px ${color}44`
          : `0 2px 8px rgba(0,0,0,.7)`,
      }}
    >
      {/* reflejo nacarado */}
      <div style={{
        position:"absolute", top:5, left:9, width:11, height:7,
        borderRadius:"50%", background:"rgba(255,255,255,.18)",
        filter:"blur(1px)", pointerEvents:"none",
      }}/>
      <span style={{
        fontSize: note.length > 2 ? 7.5 : 9.5,
        fontWeight: 800,
        color: isSel ? "#fff" : color,
        fontFamily: "'Courier New', monospace",
        lineHeight: 1, zIndex: 1,
        textShadow: isSel ? "0 1px 4px rgba(0,0,0,.9)" : "none",
      }}>{note}</span>
      <span style={{
        fontSize: 6.5, fontFamily: "monospace", lineHeight: 1, zIndex: 1,
        color: isSel ? "rgba(255,255,255,.75)" : color + "88",
      }}>{btn.id}</span>
    </div>
  );
}

// ─── CANVAS ───────────────────────────────────────────────────────
function Canvas({ buttons, mode, selected, onSelect, onMove, showGrid }) {
  const W = Math.max(...buttons.map(b => b.x)) + BTN + 40;
  const H = Math.max(...buttons.map(b => b.y)) + BTN + 20;

  return (
    <div
      onClick={() => onSelect(null)}
      style={{
        position: "relative",
        width: W, height: H,
        minWidth: 320, minHeight: 260,
        background: showGrid
          ? `repeating-linear-gradient(0deg,transparent,transparent 12px,rgba(42,24,8,.18) 13px),
             repeating-linear-gradient(90deg,transparent,transparent 12px,rgba(42,24,8,.18) 13px),
             #0e0701`
          : "#0e0701",
        border: "1px solid #2a1608",
        borderRadius: 10,
        overflow: "visible",
        touchAction: "none",
        flexShrink: 0,
      }}
    >
      {/* líneas de fila */}
      {[0,1,2,3,4].map(row => (
        <div key={row} style={{
          position:"absolute", left:0, right:0,
          top: row * ROW_H + BTN / 2,
          height:1, background:"rgba(90,58,24,.2)",
          pointerEvents:"none",
        }}/>
      ))}

      {buttons.map(btn => (
        <Key
          key={btn.id} btn={btn} mode={mode}
          selected={selected} onSelect={onSelect} onMove={onMove}
        />
      ))}
    </div>
  );
}

// ─── TABLA ────────────────────────────────────────────────────────
function Table({ buttons, mode, selected, onSelect }) {
  return (
    <div style={{
      overflowY: "auto", maxHeight: 320,
      border: "1px solid #2a1608", borderRadius: 8,
      marginTop: 12,
    }}>
      <table style={{
        borderCollapse: "collapse", fontSize: 9,
        width: "100%", fontFamily: "'Courier New', monospace",
      }}>
        <thead>
          <tr style={{ background: "#1a0e04", position: "sticky", top: 0 }}>
            {["ID","F","X","Y","Abre","Cierra"].map(h => (
              <th key={h} style={{
                padding: "5px 8px", textAlign:"left",
                color:"#6a4020", letterSpacing:"0.1em",
                borderBottom:"1px solid #2a1608",
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {buttons.map(btn => {
            const isSel = btn.id === selected;
            return (
              <tr
                key={btn.id}
                onClick={() => onSelect(btn.id)}
                style={{
                  background: isSel ? "rgba(245,192,96,.08)" : "transparent",
                  cursor: "pointer",
                  borderBottom: "1px solid rgba(26,14,4,.5)",
                }}
              >
                <td style={{ padding:"4px 8px", color: nc(btn.abre), fontWeight:700 }}>{btn.id}</td>
                <td style={{ padding:"4px 8px", color:"#5a3018" }}>F{btn.row+1}</td>
                <td style={{ padding:"4px 8px", color:"#c08040" }}>{btn.x}</td>
                <td style={{ padding:"4px 8px", color:"#c08040" }}>{btn.y}</td>
                <td style={{ padding:"4px 8px", color: nc(btn.abre) }}>{btn.abre}</td>
                <td style={{ padding:"4px 8px", color: nc(btn.cierra) }}>{btn.cierra}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── EXPORT ───────────────────────────────────────────────────────
function ExportPanel({ buttons, hand }) {
  const [type, setType] = useState(null);
  const [copied, setCopied] = useState(false);

  const jsCode = () => {
    const name = hand === "left" ? "LEFT_HAND" : "RIGHT_HAND";
    const lines = buttons.map(b =>
      `  { id:"${b.id}", x:${b.x}, y:${b.y}, row:${b.row}, abre:"${b.abre}", cierra:"${b.cierra}" },`
    );
    return `const ${name} = [\n${lines.join("\n")}\n];`;
  };

  const csvCode = () => {
    const header = "id,row,x,y,abre,cierra";
    const rows = buttons.map(b =>
      `${b.id},${b.row},${b.x},${b.y},${b.abre},${b.cierra}`
    );
    return [header, ...rows].join("\n");
  };

  const text = type === "js" ? jsCode() : type === "csv" ? csvCode() : "";

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const S = (active) => ({
    padding: "5px 12px", borderRadius: 7, border: "none",
    fontFamily: "'Courier New',monospace", fontWeight: 700,
    fontSize: 10, cursor: "pointer",
    background: active ? "linear-gradient(135deg,#0d9488,#2dd4bf)" : "#1a0e04",
    color: active ? "#0a0502" : "#7a5030",
    border: active ? "none" : "1px solid #3a2010",
  });

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
        <button style={S(type==="js")}   onClick={() => setType(t => t==="js"   ? null : "js")}>↓ JS</button>
        <button style={S(type==="csv")}  onClick={() => setType(t => t==="csv"  ? null : "csv")}>↓ CSV</button>
      </div>

      {type && (
        <div style={{ position:"relative", marginTop:8 }}>
          <textarea
            readOnly value={text}
            style={{
              width:"100%", height:130, background:"#080401",
              color:"#f5c060", border:"1px solid #3a2010",
              borderRadius:8, padding:10, fontSize:8.5,
              fontFamily:"'Courier New',monospace",
              resize:"vertical", lineHeight:1.5,
              boxSizing:"border-box",
            }}
          />
          <button
            onClick={copy}
            style={{
              position:"absolute", top:6, right:6,
              padding:"3px 10px", borderRadius:5,
              border:"1px solid #3a2010",
              background: copied ? "#0d9488" : "#1a0e04",
              color: copied ? "#fff" : "#7a5030",
              fontFamily:"monospace", fontSize:9, cursor:"pointer",
            }}
          >{copied ? "✓ Copiado" : "Copiar"}</button>
        </div>
      )}
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────
export default function App() {
  const [hand,     setHand]     = useState("left");
  const [mode,     setMode]     = useState("abre");
  const [showGrid, setShowGrid] = useState(true);
  const [selected, setSelected] = useState(null);
  const [leftBtns, setLeftBtns] = useState(() => make(DEFS_L));
  const [rightBtns,setRightBtns]= useState(() => make(DEFS_R));

  const buttons    = hand === "left" ? leftBtns    : rightBtns;
  const setButtons = hand === "left" ? setLeftBtns : setRightBtns;
  const defs       = hand === "left" ? DEFS_L      : DEFS_R;

  const handleMove = useCallback((id, x, y) => {
    setButtons(prev => prev.map(b => b.id === id ? { ...b, x, y } : b));
  }, [setButtons]);

  const handleSelect = useCallback((id) => {
    setSelected(id);
  }, []);

  // Teclado
  useEffect(() => {
    const handler = (e) => {
      if (!selected) return;
      const step = e.shiftKey ? SNAP * 2 : SNAP;
      const dirs = {
        ArrowLeft:  [-step, 0],
        ArrowRight: [ step, 0],
        ArrowUp:    [0, -step],
        ArrowDown:  [0,  step],
      };
      if (!dirs[e.key]) return;
      e.preventDefault();
      const [dx, dy] = dirs[e.key];
      setButtons(prev => prev.map(b =>
        b.id === selected
          ? { ...b, x: Math.max(0, b.x+dx), y: Math.max(0, b.y+dy) }
          : b
      ));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, setButtons]);

  const selBtn = buttons.find(b => b.id === selected);

  const btnStyle = (active, variant="orange") => ({
    padding: "6px 14px", borderRadius: 8, border: "none",
    fontFamily: "'Courier New',monospace", fontWeight: 700,
    fontSize: 10, cursor: "pointer", transition: "all .2s",
    background: active
      ? variant === "orange"
        ? "linear-gradient(135deg,#a05010,#f5c060)"
        : "linear-gradient(135deg,#1a4a8a,#4a8af0)"
      : "transparent",
    color: active
      ? variant === "orange" ? "#0a0502" : "#fff"
      : "#6a4020",
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% 0%, #1e0c03, #060301 70%)",
      padding: "16px 12px 40px",
      fontFamily: "'Courier New', monospace",
    }}>

      {/* HEADER */}
      <div style={{ textAlign:"center", marginBottom:14 }}>
        <div style={{
          fontSize:20, fontWeight:900, color:"#f5c060",
          letterSpacing:"0.1em", textShadow:"0 0 20px rgba(245,192,96,.4)",
        }}>BANDONEÓN · EDITOR DE POSICIONES</div>
        <div style={{ fontSize:9, color:"#5a3018", letterSpacing:"0.18em", marginTop:2 }}>
          ARRASTRÁ · FLECHAS PARA AJUSTE FINO · EXPORTÁ
        </div>
      </div>

      {/* CONTROLES */}
      <div style={{
        display:"flex", gap:8, justifyContent:"center",
        flexWrap:"wrap", marginBottom:14,
      }}>
        <div style={{
          display:"flex", background:"#100802",
          border:"1.5px solid #3a2010", borderRadius:10, padding:4, gap:3,
        }}>
          <button style={btnStyle(mode==="abre")}   onClick={()=>setMode("abre")}>▷ ABRIENDO</button>
          <button style={btnStyle(mode==="cierra")} onClick={()=>setMode("cierra")}>◁ CERRANDO</button>
        </div>
        <div style={{
          display:"flex", background:"#100802",
          border:"1.5px solid #3a2010", borderRadius:10, padding:4, gap:3,
        }}>
          <button style={btnStyle(hand==="left","blue")}  onClick={()=>{ setHand("left");  setSelected(null); }}>IZQ 33</button>
          <button style={btnStyle(hand==="right","blue")} onClick={()=>{ setHand("right"); setSelected(null); }}>DER 38</button>
        </div>
        <button
          onClick={()=>setShowGrid(p=>!p)}
          style={{
            padding:"6px 14px", borderRadius:10,
            border:"1.5px solid #3a2010", background:"#100802",
            color: showGrid ? "#2DD4BF" : "#6a4020",
            fontFamily:"'Courier New',monospace", fontWeight:700,
            fontSize:10, cursor:"pointer",
          }}
        >{showGrid ? "⊞ Grid ON" : "⊞ Grid OFF"}</button>
        <button
          onClick={()=>{ setButtons(make(defs)); setSelected(null); }}
          style={{
            padding:"6px 14px", borderRadius:10,
            border:"1.5px solid #3a2010", background:"#100802",
            color:"#7a5030", fontFamily:"'Courier New',monospace",
            fontWeight:700, fontSize:10, cursor:"pointer",
          }}
        >⟳ Reset</button>
      </div>

      {/* LAYOUT: canvas + tabla side by side en desktop */}
      <div style={{
        display:"flex", gap:14, maxWidth:1100,
        margin:"0 auto", flexWrap:"wrap",
      }}>

        {/* IZQUIERDA: canvas */}
        <div style={{ flex:"1 1 340px", minWidth:300 }}>
          <div style={{
            fontSize:11, fontWeight:800, color:"#f5c060",
            letterSpacing:"0.16em", marginBottom:8,
          }}>
            {hand==="left" ? "MANO IZQUIERDA · 33 botones" : "MANO DERECHA · 38 botones"}
          </div>

          <div style={{
            fontSize:9, color:"#6a4020",
            background:"#1a0e04", border:"1px solid #2a1608",
            borderRadius:7, padding:"5px 9px", marginBottom:10, lineHeight:1.6,
          }}>
            🖱 Arrastrá · ⌨ Flechas (Shift=doble) · 📱 Tocá y usá ← → ↑ ↓
          </div>

          <div style={{ overflowX:"auto", paddingBottom:8 }}>
            <Canvas
              buttons={buttons} mode={mode}
              selected={selected}
              onSelect={handleSelect}
              onMove={handleMove}
              showGrid={showGrid}
            />
          </div>

          {/* Info botón seleccionado */}
          {selBtn && (
            <div style={{
              display:"flex", gap:8, alignItems:"center",
              flexWrap:"wrap",
              background:"#1a0e04", border:"1px solid #3a2010",
              borderRadius:8, padding:"7px 10px", marginTop:8,
            }}>
              <span style={{ color:"#f5c060", fontWeight:700, fontSize:10 }}>{selBtn.id}</span>
              <span style={{ color:"#5a3018", fontSize:9 }}>x:{selBtn.x} y:{selBtn.y}</span>
              <span style={{ color: nc(selBtn.abre),   fontSize:9 }}>▷ {selBtn.abre}</span>
              <span style={{ color: nc(selBtn.cierra), fontSize:9 }}>◁ {selBtn.cierra}</span>
              {/* Nudge buttons para mobile */}
              <div style={{ marginLeft:"auto", display:"flex", gap:3 }}>
                {[["←",-SNAP,0],["→",SNAP,0],["↑",0,-SNAP],["↓",0,SNAP]].map(([l,dx,dy])=>(
                  <button key={l}
                    onClick={()=>setButtons(prev=>prev.map(b=>
                      b.id===selected ? {...b,x:Math.max(0,b.x+dx),y:Math.max(0,b.y+dy)} : b
                    ))}
                    style={{
                      width:26,height:26,borderRadius:6,
                      border:"1px solid #3a2010",background:"#100802",
                      color:"#f5c060",fontSize:12,cursor:"pointer",padding:0,
                    }}
                  >{l}</button>
                ))}
              </div>
            </div>
          )}

          <ExportPanel buttons={buttons} hand={hand} />
        </div>

        {/* DERECHA: tabla */}
        <div style={{ flex:"0 0 260px", minWidth:220 }}>
          <div style={{
            fontSize:11, fontWeight:800, color:"#f5c060",
            letterSpacing:"0.16em", marginBottom:8,
          }}>TABLA DE COORDENADAS</div>
          <div style={{
            fontSize:9, color:"#6a4020",
            background:"#1a0e04", border:"1px solid #2a1608",
            borderRadius:7, padding:"5px 9px", marginBottom:0, lineHeight:1.6,
          }}>
            Clic en una fila para seleccionar el botón en el canvas
          </div>
          <Table
            buttons={buttons} mode={mode}
            selected={selected} onSelect={handleSelect}
          />
        </div>
      </div>
    </div>
  );
}
