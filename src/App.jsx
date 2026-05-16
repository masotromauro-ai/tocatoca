import { useState, useCallback, useEffect, useRef, useMemo } from "react";

const ALL_NOTES = ["DO","DO#","RE","RE#","MI","FA","FA#","SOL","SOL#","LA","LA#","SI"];

const DEFAULT_NOTE_COLORS = {
  "DO":"#ef4444","DO#":"#f97316","RE":"#eab308","RE#":"#84cc16",
  "MI":"#22c55e","FA":"#14b8a6","FA#":"#06b6d4","SOL":"#3b82f6",
  "SOL#":"#6366f1","LA":"#8b5cf6","LA#":"#d946ef","SI":"#ec4899",
};

function useNoteColors() {
  const [colors, setColors] = useState({...DEFAULT_NOTE_COLORS});
  const setColor = (note, color) => setColors(prev => ({...prev, [note]: color}));
  const nc = (note) => colors[note] || "#94a3b8";
  const reset = () => setColors({...DEFAULT_NOTE_COLORS});
  return { colors, nc, setColor, reset };
}

const SNAP = 2;
function snapV(v) { return Math.round(v / SNAP) * SNAP; }
const BTN = 44;

function parseCSV(text) {
  const lines = text.trim().split("\n").filter(l => l.trim());
  const dataLines = lines[0].toLowerCase().startsWith("id") ? lines.slice(1) : lines;
  const result = [];
  for (const line of dataLines) {
    const parts = line.split(",").map(s => s.trim());
    if (parts.length < 6) continue;
    const [id, row, x, y, abre, cierra, color_abre, color_cierra] = parts;
    result.push({ id, row:parseInt(row), x:parseInt(x), y:parseInt(y),
      abre:abre||"DO", cierra:cierra||"DO",
      color_abre:color_abre||"", color_cierra:color_cierra||"" });
  }
  return result;
}

const DEFS_L = [
  { id:"L01", row:0, x:208, y: 46, abre:"SOL#", cierra:"SOL#", color_abre:"#ff6a00", color_cierra:"#ff6a00" },
  { id:"L02", row:0, x:308, y: 40, abre:"LA#",  cierra:"LA#",  color_abre:"#e63b7a", color_cierra:"#e63b7a" },
  { id:"L03", row:0, x:416, y: 42, abre:"DO#",  cierra:"RE#",  color_abre:"#01c7fc", color_cierra:"#84cc16" },
  { id:"L04", row:0, x:526, y: 58, abre:"FA",   cierra:"RE#",  color_abre:"#d38301", color_cierra:"#84cc16" },
  { id:"L05", row:0, x:640, y: 78, abre:"SOL#", cierra:"SOL",  color_abre:"#ff6a00", color_cierra:"#fefb41" },
  { id:"L06", row:1, x: 64, y:126, abre:"MI",   cierra:"RE",   color_abre:"#583300", color_cierra:"#587934" },
  { id:"L07", row:1, x:162, y:106, abre:"LA",   cierra:"RE",   color_abre:"#a62c17", color_cierra:"#587934" },
  { id:"L08", row:1, x:254, y: 94, abre:"SOL",  cierra:"LA#",  color_abre:"#fefb41", color_cierra:"#e63b7a" },
  { id:"L09", row:1, x:358, y: 98, abre:"RE#",  cierra:"DO",   color_abre:"#84cc16", color_cierra:"#285ff4" },
  { id:"L10", row:1, x:472, y:108, abre:"FA",   cierra:"DO#",  color_abre:"#d38301", color_cierra:"#01c7fc" },
  { id:"L11", row:1, x:576, y:108, abre:"LA#",  cierra:"DO",   color_abre:"#e63b7a", color_cierra:"#285ff4" },
  { id:"L12", row:1, x:680, y:142, abre:"FA",   cierra:"FA#",  color_abre:"#d38301", color_cierra:"#feb43f" },
  { id:"L13", row:2, x:110, y:172, abre:"RE",   cierra:"SOL",  color_abre:"#587934", color_cierra:"#fefb41" },
  { id:"L14", row:2, x:210, y:156, abre:"LA",   cierra:"SOL",  color_abre:"#a62c17", color_cierra:"#fefb41" },
  { id:"L15", row:2, x:302, y:154, abre:"DO",   cierra:"SI",   color_abre:"#285ff4", color_cierra:"#5e30eb" },
  { id:"L16", row:2, x:410, y:162, abre:"MI",   cierra:"RE",   color_abre:"#583300", color_cierra:"#587934" },
  { id:"L17", row:2, x:528, y:164, abre:"DO",   cierra:"FA",   color_abre:"#285ff4", color_cierra:"#d38301" },
  { id:"L18", row:2, x:618, y:170, abre:"SOL",  cierra:"FA#",  color_abre:"#fefb41", color_cierra:"#feb43f" },
  { id:"L19", row:3, x: 66, y:252, abre:"MI",   cierra:"LA",   color_abre:"#583300", color_cierra:"#a62c17" },
  { id:"L20", row:3, x:158, y:230, abre:"SOL#", cierra:"MI",   color_abre:"#ff6a00", color_cierra:"#583300" },
  { id:"L21", row:3, x:254, y:222, abre:"SI",   cierra:"LA",   color_abre:"#5e30eb", color_cierra:"#a62c17" },
  { id:"L22", row:3, x:354, y:218, abre:"RE",   cierra:"DO#",  color_abre:"#587934", color_cierra:"#01c7fc" },
  { id:"L23", row:3, x:458, y:224, abre:"FA#",  cierra:"MI",   color_abre:"#feb43f", color_cierra:"#583300" },
  { id:"L24", row:3, x:560, y:234, abre:"DO#",  cierra:"SOL#", color_abre:"#00a1d8", color_cierra:"#ff6a00" },
  { id:"L25", row:3, x:646, y:246, abre:"FA#",  cierra:"SI",   color_abre:"#feb43f", color_cierra:"#5e30eb" },
  { id:"L26", row:4, x: 26, y:328, abre:"RE",   cierra:"MI",   color_abre:"#587934", color_cierra:"#583300" },
  { id:"L27", row:4, x:110, y:308, abre:"SI",   cierra:"MI",   color_abre:"#5e30eb", color_cierra:"#583300" },
  { id:"L28", row:4, x:204, y:294, abre:"MI",   cierra:"SOL",  color_abre:"#583300", color_cierra:"#fefb41" },
  { id:"L29", row:4, x:298, y:288, abre:"LA",   cierra:"LA",   color_abre:"#a62c17", color_cierra:"#a62c17" },
  { id:"L30", row:4, x:390, y:286, abre:"RE#",  cierra:"SI",   color_abre:"#84cc16", color_cierra:"#5e30eb" },
  { id:"L31", row:4, x:496, y:296, abre:"FA#",  cierra:"FA",   color_abre:"#feb43f", color_cierra:"#d38301" },
  { id:"L32", row:4, x:590, y:306, abre:"RE#",  cierra:"DO#",  color_abre:"#84cc16", color_cierra:"#01c7fc" },
  { id:"L33", row:4, x:674, y:324, abre:"DO",   cierra:"FA",   color_abre:"#285ff4", color_cierra:"#d38301" },
];

const DEFS_R = [
  { id:"R01", row:0, x:174, y:  0, abre:"SI",   cierra:"SI",   color_abre:"#5e30eb", color_cierra:"#5e30eb" },
  { id:"R02", row:0, x:274, y:  0, abre:"SOL#", cierra:"SOL#", color_abre:"#ff6a00", color_cierra:"#ff6a00" },
  { id:"R03", row:0, x:376, y:  0, abre:"SOL",  cierra:"FA#",  color_abre:"#fefb41", color_cierra:"#ffc777" },
  { id:"R04", row:0, x:484, y:  0, abre:"FA",   cierra:"FA",   color_abre:"#a96800", color_cierra:"#a96800" },
  { id:"R05", row:0, x:220, y: 38, abre:"LA",   cierra:"SOL",  color_abre:"#a62c17", color_cierra:"#fefb41" },
  { id:"R06", row:0, x:326, y: 38, abre:"FA#",  cierra:"LA#",  color_abre:"#ffc777", color_cierra:"#e63b7a" },
  { id:"R07", row:0, x:432, y: 40, abre:"MI",   cierra:"DO",   color_abre:"#583300", color_cierra:"#285ff4" },
  { id:"R08", row:1, x:128, y: 46, abre:"DO#",  cierra:"DO",   color_abre:"#01c7fc", color_cierra:"#285ff4" },
  { id:"R09", row:1, x:528, y: 50, abre:"RE#",  cierra:"RE#",  color_abre:"#84cc16", color_cierra:"#84cc16" },
  { id:"R10", row:1, x: 88, y:104, abre:"DO",   cierra:"RE",   color_abre:"#285ff4", color_cierra:"#587934" },
  { id:"R11", row:1, x:178, y: 98, abre:"RE",   cierra:"DO#",  color_abre:"#587934", color_cierra:"#01c7fc" },
  { id:"R12", row:1, x:280, y: 86, abre:"SOL",  cierra:"SOL#", color_abre:"#fefb41", color_cierra:"#ff6a00" },
  { id:"R13", row:1, x:388, y: 86, abre:"LA#",  cierra:"LA#",  color_abre:"#e63b7a", color_cierra:"#e63b7a" },
  { id:"R14", row:1, x:484, y: 94, abre:"DO",   cierra:"MI",   color_abre:"#285ff4", color_cierra:"#583300" },
  { id:"R15", row:1, x:572, y:114, abre:"RE",   cierra:"RE",   color_abre:"#587934", color_cierra:"#587934" },
  { id:"R16", row:2, x: 42, y:188, abre:"SI",   cierra:"DO",   color_abre:"#5e30eb", color_cierra:"#285ff4" },
  { id:"R17", row:2, x:136, y:168, abre:"MI",   cierra:"DO#",  color_abre:"#583300", color_cierra:"#01c7fc" },
  { id:"R18", row:2, x:236, y:156, abre:"DO#",  cierra:"FA#",  color_abre:"#01c7fc", color_cierra:"#ffc777" },
  { id:"R19", row:2, x:342, y:148, abre:"FA#",  cierra:"SI",   color_abre:"#ffc777", color_cierra:"#5e30eb" },
  { id:"R20", row:2, x:436, y:156, abre:"LA",   cierra:"SI",   color_abre:"#a62c17", color_cierra:"#5e30eb" },
  { id:"R21", row:2, x:530, y:164, abre:"DO",   cierra:"RE",   color_abre:"#285ff4", color_cierra:"#587934" },
  { id:"R22", row:2, x:612, y:184, abre:"MI",   cierra:"SOL",  color_abre:"#583300", color_cierra:"#fefb41" },
  { id:"R23", row:2, x:  0, y:262, abre:"LA",   cierra:"RE",   color_abre:"#a62c17", color_cierra:"#587934" },
  { id:"R24", row:2, x: 94, y:246, abre:"FA",   cierra:"FA",   color_abre:"#a96800", color_cierra:"#a96800" },
  { id:"R25", row:3, x:188, y:232, abre:"LA#",  cierra:"MI",   color_abre:"#e63b7a", color_cierra:"#583300" },
  { id:"R26", row:3, x:284, y:224, abre:"SOL#", cierra:"LA",   color_abre:"#ff6a00", color_cierra:"#a62c17" },
  { id:"R27", row:3, x:386, y:224, abre:"SI",   cierra:"DO#",  color_abre:"#5e30eb", color_cierra:"#01c7fc" },
  { id:"R28", row:3, x:478, y:232, abre:"RE",   cierra:"MI",   color_abre:"#587934", color_cierra:"#583300" },
  { id:"R29", row:3, x:570, y:246, abre:"SOL#", cierra:"LA",   color_abre:"#ff6a00", color_cierra:"#a62c17" },
  { id:"R30", row:3, x:654, y:266, abre:"SI",   cierra:"DO#",  color_abre:"#5e30eb", color_cierra:"#01c7fc" },
  { id:"R31", row:3, x: 26, y:328, abre:"LA#",  cierra:"LA#",  color_abre:"#e63b7a", color_cierra:"#e63b7a" },
  { id:"R32", row:3, x:122, y:312, abre:"RE#",  cierra:"RE#",  color_abre:"#84cc16", color_cierra:"#84cc16" },
  { id:"R33", row:4, x:220, y:298, abre:"FA",   cierra:"FA",   color_abre:"#a96800", color_cierra:"#a96800" },
  { id:"R34", row:4, x:316, y:296, abre:"RE#",  cierra:"MI",   color_abre:"#84cc16", color_cierra:"#583300" },
  { id:"R35", row:4, x:412, y:300, abre:"FA#",  cierra:"SOL#", color_abre:"#ffc777", color_cierra:"#ff6a00" },
  { id:"R36", row:4, x:500, y:308, abre:"LA",   cierra:"SI",   color_abre:"#a62c17", color_cierra:"#5e30eb" },
  { id:"R37", row:4, x:594, y:322, abre:"DO#",  cierra:"MI",   color_abre:"#01c7fc", color_cierra:"#583300" },
  { id:"R38", row:4, x:680, y:346, abre:"SOL",  cierra:"RE#",  color_abre:"#fefb41", color_cierra:"#84cc16" },
];

function Key({ btn, mode, selected, isHeard, onSelect, onMove, nc }) {
  const note = mode === "abre" ? btn.abre : btn.cierra;
  const colorOverride = mode === "abre" ? btn.color_abre : btn.color_cierra;
  const color = colorOverride || nc(note);
  const isSel = selected === btn.id;
  const isActive = isSel || isHeard;

  const onMouseDown = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    onSelect(btn.id);
    const ox = e.clientX - btn.x, oy = e.clientY - btn.y;
    const move = (e2) => onMove(btn.id, snapV(Math.max(0,e2.clientX-ox)), snapV(Math.max(0,e2.clientY-oy)));
    const up = () => { window.removeEventListener("mousemove",move); window.removeEventListener("mouseup",up); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }, [btn, onSelect, onMove]);

  const onTouchStart = useCallback((e) => {
    e.stopPropagation(); onSelect(btn.id);
    const t=e.touches[0], ox=t.clientX-btn.x, oy=t.clientY-btn.y;
    const move=(e2)=>{ e2.preventDefault(); const t2=e2.touches[0]; onMove(btn.id,snapV(Math.max(0,t2.clientX-ox)),snapV(Math.max(0,t2.clientY-oy))); };
    const up=()=>{ window.removeEventListener("touchmove",move); window.removeEventListener("touchend",up); };
    window.addEventListener("touchmove",move,{passive:false});
    window.addEventListener("touchend",up);
  }, [btn, onSelect, onMove]);

  return (
    <div onMouseDown={onMouseDown} onTouchStart={onTouchStart} style={{
      position:"absolute", left:btn.x, top:btn.y, width:BTN, height:BTN,
      borderRadius:"50%", cursor:"grab", touchAction:"none", userSelect:"none",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      zIndex:isActive?100:10,
      background:isActive
        ?`radial-gradient(circle at 36% 30%,${color}ff,${color}cc 55%,${color}88)`
        :`radial-gradient(circle at 36% 30%,${color}99,${color}44 60%,${color}22)`,
      border:`2.5px solid ${isActive?(isHeard?"#ffffff":color):color+"aa"}`,
      boxShadow:isActive
        ?(isHeard?`0 0 25px #fff,0 0 50px ${color}`:`0 0 20px ${color}cc,0 0 40px ${color}55`)
        :"0 2px 8px rgba(0,0,0,.7)",
      transform:isHeard?"scale(1.08)":"scale(1)",
      transition:"box-shadow .12s,transform .1s,border-color .1s",
    }}>
      <div style={{position:"absolute",top:5,left:9,width:12,height:8,borderRadius:"50%",background:"rgba(255,255,255,.25)",filter:"blur(1px)",pointerEvents:"none"}}/>
      <span style={{fontSize:note.length>2?7.5:9.5,fontWeight:800,color:"#fff",fontFamily:"'Courier New',monospace",lineHeight:1,zIndex:1,textShadow:"0 1px 3px rgba(0,0,0,.8)"}}>{note}</span>
      <span style={{fontSize:6.5,fontFamily:"monospace",lineHeight:1,zIndex:1,color:isHeard?"#fff":"rgba(255,255,255,.7)",fontWeight:isHeard?900:400}}>{btn.id}</span>
    </div>
  );
}

function Canvas({ buttons, mode, selected, heardIds, onSelect, onMove, showGrid, nc }) {
  const W = Math.max(...buttons.map(b=>b.x)) + BTN + 24;
  const H = Math.max(...buttons.map(b=>b.y)) + BTN + 20;
  return (
    <div onClick={()=>onSelect(null)} style={{
      position:"relative", width:W, height:H, flexShrink:0,
      background:showGrid
        ?`repeating-linear-gradient(0deg,transparent,transparent 9px,rgba(90,58,24,.2) 10px),repeating-linear-gradient(90deg,transparent,transparent 9px,rgba(90,58,24,.2) 10px),#0e0701`
        :"#0e0701",
      border:"1px solid #2a1608", borderRadius:10, touchAction:"none",
    }}>
      {buttons.map(btn=>(
        <Key key={btn.id} btn={btn} mode={mode} selected={selected}
          isHeard={heardIds.includes(btn.id)}
          onSelect={onSelect} onMove={onMove} nc={nc}/>
      ))}
    </div>
  );
}

function ImportCSV({ onImport }) {
  const fileRef=useRef(null);
  const [paste,setPaste]=useState("");
  const [open,setOpen]=useState(false);
  const [error,setError]=useState("");
  const doImport=(text)=>{
    try{const parsed=parseCSV(text);if(!parsed.length)throw new Error("Sin datos");onImport(parsed);setOpen(false);setPaste("");setError("");}
    catch(e){setError(e.message);}
  };
  const handleFile=(e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=(ev)=>doImport(ev.target.result);r.readAsText(f);e.target.value="";};
  return (
    <div style={{marginBottom:8}}>
      <button onClick={()=>setOpen(p=>!p)} style={{padding:"5px 12px",borderRadius:8,border:"1px solid #3a2010",background:"#1a0e04",color:"#2DD4BF",fontFamily:"'Courier New',monospace",fontWeight:700,fontSize:10,cursor:"pointer"}}>
        ↑ {open?"Ocultar importar":"Importar CSV"}
      </button>
      {open&&(
        <div style={{marginTop:8,padding:"12px 14px",background:"#0e0701",border:"1px solid #2a1608",borderRadius:10}}>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:9,color:"#6a4020",marginBottom:5}}>Opción 1 — Cargar archivo .csv</div>
            <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFile} style={{display:"none"}}/>
            <button onClick={()=>fileRef.current.click()} style={{padding:"5px 14px",borderRadius:7,border:"1px solid #3a2010",background:"#1a0e04",color:"#f5c060",fontFamily:"'Courier New',monospace",fontWeight:700,fontSize:10,cursor:"pointer"}}>📂 Elegir archivo</button>
          </div>
          <div>
            <div style={{fontSize:9,color:"#6a4020",marginBottom:5}}>Opción 2 — Pegar contenido CSV</div>
            <textarea value={paste} onChange={e=>setPaste(e.target.value)}
              placeholder="id,row,x,y,abre,cierra,color_abre,color_cierra"
              style={{width:"100%",height:80,background:"#080401",color:"#f5c060",border:"1px solid #3a2010",borderRadius:8,padding:8,fontSize:8,fontFamily:"'Courier New',monospace",resize:"vertical",lineHeight:1.5,boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:6,marginTop:6}}>
              <button onClick={()=>doImport(paste)} style={{padding:"5px 14px",borderRadius:7,border:"none",background:"linear-gradient(135deg,#0d9488,#2dd4bf)",color:"#0a0502",fontFamily:"'Courier New',monospace",fontWeight:700,fontSize:10,cursor:"pointer"}}>✓ Aplicar</button>
              <button onClick={()=>{setPaste("");setError("");}} style={{padding:"5px 12px",borderRadius:7,border:"1px solid #3a2010",background:"transparent",color:"#6a4020",fontFamily:"monospace",fontSize:10,cursor:"pointer"}}>✕ Limpiar</button>
            </div>
          </div>
          {error&&<div style={{marginTop:8,fontSize:9,color:"#ef4444",background:"#1a0404",border:"1px solid #ef444444",borderRadius:6,padding:"4px 8px"}}>⚠ {error}</div>}
        </div>
      )}
    </div>
  );
}

function NoteSelect({ value, onChange, field, nc }) {
  return (
    <select value={value} onChange={e=>onChange(field,e.target.value)} onClick={e=>e.stopPropagation()}
      style={{background:"#1a0e04",color:nc(value),border:`1px solid ${nc(value)}55`,borderRadius:5,padding:"2px 3px",fontFamily:"'Courier New',monospace",fontWeight:700,fontSize:9,cursor:"pointer",width:58}}>
      {ALL_NOTES.map(n=><option key={n} value={n} style={{color:nc(n),background:"#1a0e04"}}>{n}</option>)}
    </select>
  );
}

function Table({ buttons, mode, selected, heardIds, onSelect, onEdit, nc }) {
  return (
    <div style={{overflowY:"auto",maxHeight:"calc(100vh - 260px)",border:"1px solid #2a1608",borderRadius:8}}>
      <table style={{borderCollapse:"collapse",fontSize:9,width:"100%",fontFamily:"'Courier New',monospace"}}>
        <thead>
          <tr style={{background:"#1a0e04",position:"sticky",top:0,zIndex:5}}>
            {["ID","F","X","Y","▷ Abre","◁ Cierra","🎨▷","🎨◁"].map(h=>(
              <th key={h} style={{padding:"6px 5px",textAlign:"left",color:"#6a4020",letterSpacing:"0.06em",borderBottom:"1px solid #2a1608",whiteSpace:"nowrap"}}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {buttons.map(btn=>{
            const isSel=btn.id===selected;
            const isHeard=heardIds.includes(btn.id);
            const noteNow=mode==="abre"?btn.abre:btn.cierra;
            const colorOverrideNow=mode==="abre"?btn.color_abre:btn.color_cierra;
            const btnColor=colorOverrideNow||nc(noteNow);
            return(
              <tr key={btn.id} onClick={()=>onSelect(btn.id)} style={{
                background:isHeard?"rgba(255,255,255,0.15)":(isSel?"rgba(245,192,96,.09)":"transparent"),
                cursor:"pointer",borderBottom:"1px solid rgba(26,14,4,.6)",
                outline:isHeard?"1px solid #ffffff":(isSel?"1px solid rgba(245,192,96,.25)":"none"),
                transition:"background 0.1s",
              }}>
                <td style={{padding:"3px 5px"}}>
                  <span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:btnColor,marginRight:4,verticalAlign:"middle"}}/>
                  <span style={{color:btnColor,fontWeight:700}}>{btn.id}</span>
                </td>
                <td style={{padding:"3px 5px",color:"#4a2e10"}}>F{btn.row+1}</td>
                <td style={{padding:"3px 5px",color:"#7a5030"}}>{btn.x}</td>
                <td style={{padding:"3px 5px",color:"#7a5030"}}>{btn.y}</td>
                <td style={{padding:"2px 3px"}}><NoteSelect value={btn.abre}   onChange={(f,v)=>onEdit(btn.id,f,v)} field="abre"   nc={nc}/></td>
                <td style={{padding:"2px 3px"}}><NoteSelect value={btn.cierra} onChange={(f,v)=>onEdit(btn.id,f,v)} field="cierra" nc={nc}/></td>
                <td style={{padding:"2px 3px"}} onClick={e=>e.stopPropagation()}>
                  <input type="color" value={btn.color_abre||nc(btn.abre)} onChange={e=>onEdit(btn.id,"color_abre",e.target.value)}
                    title="Color ABRIENDO" style={{width:24,height:20,padding:1,borderRadius:4,border:"1px solid #3a2010",background:"#1a0e04",cursor:"pointer"}}/>
                </td>
                <td style={{padding:"2px 3px"}} onClick={e=>e.stopPropagation()}>
                  <input type="color" value={btn.color_cierra||nc(btn.cierra)} onChange={e=>onEdit(btn.id,"color_cierra",e.target.value)}
                    title="Color CERRANDO" style={{width:24,height:20,padding:1,borderRadius:4,border:"1px solid #3a2010",background:"#1a0e04",cursor:"pointer"}}/>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ColorPanel({ colors, setColor, onReset }) {
  const [open,setOpen]=useState(false);
  return (
    <div style={{marginBottom:8}}>
      <button onClick={()=>setOpen(p=>!p)} style={{padding:"5px 12px",borderRadius:8,border:"1px solid #3a2010",background:"#1a0e04",color:"#7a5030",fontFamily:"'Courier New',monospace",fontWeight:700,fontSize:10,cursor:"pointer"}}>
        🎨 {open?"Ocultar":"Colores por nota"}
      </button>
      {open&&(
        <div style={{marginTop:8,padding:"10px 12px",background:"#1a0e04",border:"1px solid #2a1608",borderRadius:8,display:"flex",flexWrap:"wrap",gap:8}}>
          {ALL_NOTES.map(note=>(
            <div key={note} style={{display:"flex",alignItems:"center",gap:4}}>
              <input type="color" value={colors[note]} onChange={e=>setColor(note,e.target.value)}
                style={{width:24,height:20,padding:1,borderRadius:3,border:`1px solid ${colors[note]}`,background:"#0e0701",cursor:"pointer"}}/>
              <span style={{fontSize:9,color:colors[note],fontFamily:"'Courier New',monospace",fontWeight:700}}>{note}</span>
            </div>
          ))}
          <button onClick={onReset} style={{padding:"3px 10px",borderRadius:6,border:"1px solid #3a2010",background:"#0e0701",color:"#6a4020",fontFamily:"monospace",fontSize:9,cursor:"pointer"}}>⟳ Restaurar</button>
        </div>
      )}
    </div>
  );
}

function ExportPanel({ buttons, hand, nc }) {
  const [type,setType]=useState(null);
  const [copied,setCopied]=useState(false);
  const csvText=()=>{
    const h="id,row,x,y,abre,cierra,color_abre,color_cierra";
    const r=buttons.map(b=>`${b.id},${b.row},${b.x},${b.y},${b.abre},${b.cierra},${b.color_abre||nc(b.abre)},${b.color_cierra||nc(b.cierra)}`);
    return[h,...r].join("\n");
  };
  const jsText=()=>{
    const name=hand==="left"?"LEFT_HAND":"RIGHT_HAND";
    const lines=buttons.map(b=>`  { id:"${b.id}", x:${b.x}, y:${b.y}, row:${b.row}, abre:"${b.abre}", cierra:"${b.cierra}", color_abre:"${b.color_abre||nc(b.abre)}", color_cierra:"${b.color_cierra||nc(b.cierra)}" },`);
    return`const ${name} = [\n${lines.join("\n")}\n];`;
  };
  const text=type==="csv"?csvText():type==="js"?jsText():"";
  const copy=()=>navigator.clipboard.writeText(text).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);});
  const download=()=>{const blob=new Blob([csvText()],{type:"text/csv"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`bandoneon_${hand}_${Date.now()}.csv`;a.click();URL.revokeObjectURL(url);};
  const bS=(active)=>({padding:"5px 12px",borderRadius:7,fontFamily:"'Courier New',monospace",fontWeight:700,fontSize:10,cursor:"pointer",transition:"all .2s",background:active?"linear-gradient(135deg,#0d9488,#2dd4bf)":"#1a0e04",color:active?"#0a0502":"#7a5030",border:active?"none":"1px solid #3a2010"});
  return(
    <div style={{marginTop:10}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        <button style={bS(type==="csv")} onClick={()=>setType(t=>t==="csv"?null:"csv")}>↓ Ver CSV</button>
        <button style={bS(type==="js")}  onClick={()=>setType(t=>t==="js"?null:"js")}>↓ Ver JS</button>
        <button onClick={download} style={{padding:"5px 12px",borderRadius:7,border:"1px solid #3a2010",background:"#1a0e04",color:"#f5c060",fontFamily:"'Courier New',monospace",fontWeight:700,fontSize:10,cursor:"pointer"}}>⬇ Descargar .csv</button>
      </div>
      {type&&(
        <div style={{position:"relative",marginTop:8}}>
          <textarea readOnly value={text} style={{width:"100%",height:130,background:"#080401",color:"#f5c060",border:"1px solid #3a2010",borderRadius:8,padding:10,fontSize:8,fontFamily:"'Courier New',monospace",resize:"vertical",lineHeight:1.5,boxSizing:"border-box"}}/>
          <button onClick={copy} style={{position:"absolute",top:6,right:6,padding:"3px 10px",borderRadius:5,border:"1px solid #3a2010",background:copied?"#0d9488":"#1a0e04",color:copied?"#fff":"#7a5030",fontFamily:"monospace",fontSize:9,cursor:"pointer"}}>{copied?"✓ Copiado":"Copiar"}</button>
        </div>
      )}
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [hand,     setHand]     = useState("left");
  const [mode,     setMode]     = useState("abre");
  const [showGrid, setShowGrid] = useState(true);
  const [selected, setSelected] = useState(null);
  const [leftBtns, setLeftBtns] = useState(()=>DEFS_L.map(b=>({...b})));
  const [rightBtns,setRightBtns]= useState(()=>DEFS_R.map(b=>({...b})));
  const { colors, nc, setColor, reset: resetColors } = useNoteColors();

  // Micrófono
  const [isListening, setIsListening] = useState(false);
  const [heardNote,   setHeardNote]   = useState("");
  const [errorAudio,  setErrorAudio]  = useState("");

  const buttons    = hand==="left" ? leftBtns    : rightBtns;
  const setButtons = hand==="left" ? setLeftBtns : setRightBtns;
  const initDefs   = hand==="left" ? DEFS_L      : DEFS_R;

  const NOTES_ENG  = useMemo(()=>["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],[]);
  const ENG_TO_LAT = useMemo(()=>({C:"DO","C#":"DO#",D:"RE","D#":"RE#",E:"MI",F:"FA","F#":"FA#",G:"SOL","G#":"SOL#",A:"LA","A#":"LA#",B:"SI"}),[]);

  // IDs de botones que coinciden con la nota detectada por el mic
  const heardIds = useMemo(()=>{
    if(!heardNote) return [];
    return buttons.filter(b=>(mode==="abre"?b.abre:b.cierra)===heardNote).map(b=>b.id);
  },[heardNote,buttons,mode]);

  const handleMove   = useCallback((id,x,y)=>setButtons(prev=>prev.map(b=>b.id===id?{...b,x,y}:b)),[setButtons]);
  const handleEdit   = useCallback((id,f,v) =>setButtons(prev=>prev.map(b=>b.id===id?{...b,[f]:v}:b)),[setButtons]);
  const handleImport = useCallback((parsed) =>setButtons(prev=>{const m={};prev.forEach(b=>{m[b.id]=b;});return parsed.map(p=>({...(m[p.id]||{}),...p}));}),[setButtons]);

  useEffect(()=>{
    const handler=e=>{
      if(!selected)return;
      const step=e.shiftKey?10:SNAP;
      const dirs={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]};
      if(!dirs[e.key])return;
      e.preventDefault();
      const[dx,dy]=dirs[e.key];
      setButtons(prev=>prev.map(b=>b.id===selected?{...b,x:Math.max(0,b.x+dx),y:Math.max(0,b.y+dy)}:b));
    };
    window.addEventListener("keydown",handler);
    return()=>window.removeEventListener("keydown",handler);
  },[selected,setButtons]);

  // ─── MOTOR DE AUDIO — YIN via Pitchfinder ───────────────────────────────
  useEffect(()=>{
    if(!isListening){setHeardNote("");return;}

    let audioCtx=null, stream=null, rafId=null;

    async function start(){
      try{
        // Resolver YINFactory independiente de la versión del UMD
        const PF = window.Pitchfinder;
        const YINFactory = PF && (
          PF.YIN ||
          (PF.default && PF.default.YIN) ||
          (PF.frequencies && PF.frequencies.YIN)
        );
        if(!YINFactory){
          setErrorAudio("Pitchfinder aún no cargó. Esperá 2 segundos y volvé a intentar.");
          setIsListening(false);
          return;
        }

        stream = await navigator.mediaDevices.getUserMedia({audio:true,video:false});
        const AC = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AC();
        if(audioCtx.state==="suspended") await audioCtx.resume();

        const src      = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        src.connect(analyser);

        const buf     = new Float32Array(analyser.fftSize);
        const detect  = YINFactory({sampleRate: audioCtx.sampleRate || 44100});

        function tick(){
          analyser.getFloatTimeDomainData(buf);
          const pitch = detect(buf);
          if(pitch && pitch > 50 && pitch < 1800){
            const noteNum = 12*(Math.log(pitch/440)/Math.log(2))+69;
            const eng     = NOTES_ENG[Math.round(noteNum)%12];
            setHeardNote(ENG_TO_LAT[eng]||"DO");
          } else {
            setHeardNote("");
          }
          rafId = requestAnimationFrame(tick);
        }
        tick();

      }catch(err){
        console.error(err);
        setErrorAudio("Error de micrófono: "+err.message);
        setIsListening(false);
      }
    }

    start();
    return()=>{
      if(rafId)cancelAnimationFrame(rafId);
      if(stream)stream.getTracks().forEach(t=>t.stop());
      if(audioCtx)audioCtx.close();
    };
  },[isListening, NOTES_ENG, ENG_TO_LAT]);

  const selBtn = buttons.find(b=>b.id===selected);
  const rowCounts = {};
  buttons.forEach(b=>{rowCounts[b.row]=(rowCounts[b.row]||0)+1;});

  const cBtn=(active,variant="orange")=>({
    padding:"6px 13px",borderRadius:8,border:"none",
    fontFamily:"'Courier New',monospace",fontWeight:700,fontSize:10,cursor:"pointer",transition:"all .2s",
    background:active?(variant==="orange"?"linear-gradient(135deg,#a05010,#f5c060)":"linear-gradient(135deg,#1a4a8a,#4a8af0)"):"transparent",
    color:active?(variant==="orange"?"#0a0502":"#fff"):"#6a4020",
  });

  return(
    <div style={{minHeight:"100vh",background:"radial-gradient(ellipse at 50% 0%,#1e0c03,#060301 70%)",padding:"14px 12px 40px",fontFamily:"'Courier New',monospace"}}>

      {/* HEADER */}
      <div style={{textAlign:"center",marginBottom:10}}>
        <div style={{fontSize:18,fontWeight:900,color:"#f5c060",letterSpacing:"0.1em",textShadow:"0 0 20px rgba(245,192,96,.4)"}}>BANDONEÓN · EDITOR V2</div>
        <div style={{fontSize:8,color:"#5a3018",letterSpacing:"0.18em",marginTop:1}}>FUSIÓN MICRÓFONO EN TIEMPO REAL + CONFIGURACIÓN DE TECLADO</div>
      </div>

      {/* PANEL MICRÓFONO */}
      <div style={{maxWidth:780,margin:"0 auto 12px",padding:"10px 14px",background:"#0a0602",border:"1.5px dashed #5a3018",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flex:"1 1 auto"}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:isListening?"#2DD4BF":"#4a2e10",boxShadow:isListening?"0 0 10px #2DD4BF":"none"}}/>
          <div>
            <div style={{fontSize:10,fontWeight:800,color:"#eab308"}}>MODO ESCUCHA FÍSICA</div>
            <div style={{fontSize:7.5,color:"#6a4020"}}>Tocá tu instrumento. Los botones con esa nota se iluminarán en blanco.</div>
          </div>
        </div>

        {isListening&&(
          <div style={{background:heardNote?`${DEFAULT_NOTE_COLORS[heardNote]}22`:"#140c05",border:`1px solid ${heardNote?DEFAULT_NOTE_COLORS[heardNote]:"#3a2010"}`,padding:"4px 12px",borderRadius:8,minWidth:65,textAlign:"center",transition:"all 0.1s"}}>
            <span style={{fontSize:8,color:"#6a4020",display:"block"}}>NOTA MIC</span>
            <span style={{fontSize:13,fontWeight:900,color:heardNote?DEFAULT_NOTE_COLORS[heardNote]:"#4a2e10"}}>{heardNote||"..."}</span>
          </div>
        )}

        <button onClick={()=>{setIsListening(p=>!p);setErrorAudio("");}} style={{
          padding:"6px 14px",borderRadius:8,border:"none",fontFamily:"monospace",fontWeight:700,fontSize:10,cursor:"pointer",
          background:isListening?"linear-gradient(135deg,#941c1c,#ef4444)":"linear-gradient(135deg,#134e4a,#2dd4bf)",
          color:isListening?"#fff":"#0f172a",
        }}>{isListening?"✕ Apagar Mic":"🎙️ Escuchar Instrumento"}</button>
      </div>

      {errorAudio&&(
        <div style={{maxWidth:780,margin:"0 auto 10px",padding:"6px 12px",background:"#270808",border:"1px solid #ef444455",borderRadius:6,fontSize:9,color:"#f87171",fontFamily:"monospace"}}>
          ⚠ {errorAudio}
        </div>
      )}

      {/* CONTROLES */}
      <div style={{display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap",marginBottom:10}}>
        <div style={{display:"flex",background:"#100802",border:"1.5px solid #3a2010",borderRadius:10,padding:3,gap:3}}>
          <button style={cBtn(mode==="abre")}   onClick={()=>setMode("abre")}>▷ ABRIENDO</button>
          <button style={cBtn(mode==="cierra")} onClick={()=>setMode("cierra")}>◁ CERRANDO</button>
        </div>
        <div style={{display:"flex",background:"#100802",border:"1.5px solid #3a2010",borderRadius:10,padding:3,gap:3}}>
          <button style={cBtn(hand==="left","blue")}  onClick={()=>{setHand("left"); setSelected(null);}}>IZQ {leftBtns.length}</button>
          <button style={cBtn(hand==="right","blue")} onClick={()=>{setHand("right");setSelected(null);}}>DER {rightBtns.length}</button>
        </div>
        <button onClick={()=>setShowGrid(p=>!p)} style={{padding:"6px 11px",borderRadius:10,border:"1.5px solid #3a2010",background:"#100802",color:showGrid?"#2DD4BF":"#6a4020",fontFamily:"'Courier New',monospace",fontWeight:700,fontSize:10,cursor:"pointer"}}>{showGrid?"⊞ Grid ON":"⊞ Grid"}</button>
        <button onClick={()=>{setButtons(initDefs.map(b=>({...b})));setSelected(null);}} style={{padding:"6px 11px",borderRadius:10,border:"1.5px solid #3a2010",background:"#100802",color:"#7a5030",fontFamily:"'Courier New',monospace",fontWeight:700,fontSize:10,cursor:"pointer"}}>⟳ Reset</button>
      </div>

      {/* CONTEO FILAS */}
      <div style={{display:"flex",gap:5,justifyContent:"center",flexWrap:"wrap",marginBottom:10}}>
        {Object.entries(rowCounts).map(([row,cnt])=>(
          <span key={row} style={{fontSize:8,color:"#7a5030",fontFamily:"monospace",background:"#1a0e04",border:"1px solid #2a1608",borderRadius:4,padding:"1px 7px"}}>F{parseInt(row)+1}: {cnt}</span>
        ))}
        <span style={{fontSize:8,color:"#3a6030",fontFamily:"monospace",background:"#0a1a04",border:"1px solid #1a3008",borderRadius:4,padding:"1px 7px"}}>SNAP {SNAP}px · ⇧=10px</span>
      </div>

      {/* LAYOUT */}
      <div style={{display:"flex",gap:12,maxWidth:1200,margin:"0 auto",flexWrap:"wrap"}}>

        <div style={{flex:"1 1 420px",minWidth:340}}>
          <div style={{fontSize:10,fontWeight:800,color:"#f5c060",letterSpacing:"0.14em",marginBottom:6}}>{hand==="left"?"MANO IZQUIERDA":"MANO DERECHA"}</div>
          <div style={{fontSize:8,color:"#6a4020",background:"#1a0e04",border:"1px solid #2a1608",borderRadius:6,padding:"4px 9px",marginBottom:8,lineHeight:1.6}}>
            🖱 Arrastrá · ⌨ Flechas 2px (Shift=10px) · 🎙️ Mic activo → botones con esa nota brillan en blanco
          </div>
          <ImportCSV onImport={handleImport}/>
          <ColorPanel colors={colors} setColor={setColor} onReset={resetColors}/>
          <div style={{overflowX:"auto",paddingBottom:6}}>
            <Canvas buttons={buttons} mode={mode} selected={selected} heardIds={heardIds}
              onSelect={setSelected} onMove={handleMove} showGrid={showGrid} nc={nc}/>
          </div>
          {selBtn&&(
            <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",background:"#1a0e04",border:"1px solid #3a2010",borderRadius:8,padding:"6px 10px",marginTop:8}}>
              <span style={{color:"#f5c060",fontWeight:700,fontSize:11}}>{selBtn.id}</span>
              <span style={{color:"#7a5030",fontSize:9}}>x:{selBtn.x} y:{selBtn.y}</span>
              <span style={{fontSize:9,color:selBtn.color_abre||nc(selBtn.abre)}}>▷ {selBtn.abre}</span>
              <span style={{fontSize:9,color:selBtn.color_cierra||nc(selBtn.cierra)}}>◁ {selBtn.cierra}</span>
              <div style={{marginLeft:"auto",display:"flex",gap:3}}>
                {[["←",-SNAP,0],["→",SNAP,0],["↑",0,-SNAP],["↓",0,SNAP]].map(([l,dx,dy])=>(
                  <button key={l} onClick={()=>setButtons(prev=>prev.map(b=>b.id===selected?{...b,x:Math.max(0,b.x+dx),y:Math.max(0,b.y+dy)}:b))}
                    style={{width:28,height:28,borderRadius:6,border:"1px solid #3a2010",background:"#100802",color:"#f5c060",fontSize:13,cursor:"pointer",padding:0}}>{l}</button>
                ))}
              </div>
            </div>
          )}
          <ExportPanel buttons={buttons} hand={hand} nc={nc}/>
        </div>

        <div style={{flex:"0 0 340px",minWidth:300}}>
          <div style={{fontSize:10,fontWeight:800,color:"#f5c060",letterSpacing:"0.14em",marginBottom:6}}>TABLA · NOTAS Y COLORES</div>
          <div style={{fontSize:8,color:"#6a4020",background:"#1a0e04",border:"1px solid #2a1608",borderRadius:6,padding:"4px 9px",marginBottom:8,lineHeight:1.6}}>
            Fila blanca = nota detectada por mic · Desplegable = nota · 🎨 = color abre/cierra
          </div>
          <Table buttons={buttons} mode={mode} selected={selected} heardIds={heardIds}
            onSelect={setSelected} onEdit={handleEdit} nc={nc}/>
        </div>
      </div>
    </div>
  );
}
