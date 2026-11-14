// Las figuras del manual: tira y rueda cromática, mezcla y piezas de capítulo.

import { paletteReal } from "../../teoria/color-hsl.js";
import { CHROMATIC } from "../../teoria/notas.js";
import { mixLuzRaizDominante, nc } from "../../teoria/color.js";
import { playTone } from "../../audio/audio.js";
import { CROM_SIMPLE } from "../../teoria/etiquetas.js";

// ─── Tira lineal de los 12 colores ───────────────────────────────────────────
export const TiraCromatica=({highlight=[], usePaletteReal=false})=>(
  <div className="flex flex-wrap gap-1.5 justify-center">
    {CHROMATIC.map(n=>{
      const active = highlight.length===0 || highlight.includes(n);
      const color = usePaletteReal ? paletteReal[n] : nc(n);
      return(
        <div key={n} className="flex flex-col items-center" style={{opacity:active?1:0.28}}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2" style={{background:color,borderColor:color}}
            onClick={()=>playTone(n,4,0.6)}/>
          <span className="text-[10px] text-gray-400 mt-1">{CROM_SIMPLE[n]}</span>
        </div>
      );
    })}
  </div>
);

// ─── Rueda cromática de los 12 colores ───────────────────────────────────────
export const RuedaCromatica=({size=270, highlight=[], usePaletteReal=false, showHex=false})=>{
  const cx=size/2, cy=size/2, R=size*0.36;
  return(
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto block" style={{maxWidth:size, width:"100%"}}>
      <circle cx={cx} cy={cy} r={R+28} fill="#0a0a0a" stroke="#232323" strokeWidth="1"/>
      {CHROMATIC.map((n,i)=>{
        const angle=(i*30-90)*(Math.PI/180);
        const x=cx+R*Math.cos(angle), y=cy+R*Math.sin(angle);
        const active = highlight.length===0 || highlight.includes(n);
        const color = usePaletteReal ? paletteReal[n] : nc(n);
        return(
          <g key={n} opacity={active?1:0.28} style={{cursor:"pointer"}} onClick={()=>playTone(n,4,0.6)}>
            <circle cx={x} cy={y} r={17} fill={color} stroke="#fff" strokeOpacity="0.18" strokeWidth="1.5"/>
            <text x={x} y={y+30} textAnchor="middle" fontSize="10" fill="#aaa" fontFamily="serif">{CROM_SIMPLE[n]}</text>
            {showHex&&<text x={x} y={y+41} textAnchor="middle" fontSize="6.5" fill="#666" fontFamily="monospace">{color}</text>}
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={3} fill="#333"/>
    </svg>
  );
};

// ─── Tarjeta de mezcla (Cap. 6 / 10): notas de entrada → color resultante ────
export const MixFigure=({titulo, notes, rootWeight=0.8, nota})=>{
  const mix = mixLuzRaizDominante(notes, rootWeight);
  return(
    <div className="rounded-xl border border-gray-800 p-3" style={{background:"#121212"}}>
      <p className="text-xs text-gray-500 mb-2">{titulo}</p>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {notes.map((n,i)=>(
          <div key={i} className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-md border border-white/10" style={{background:nc(n)}}/>
            <span className="text-[9px] text-gray-500 mt-0.5">{CROM_SIMPLE[n]||n}</span>
          </div>
        ))}
        <span className="text-gray-600 mx-1">↓</span>
        <div className="flex flex-col items-center">
          <div className="w-16 h-9 rounded-md border-2 border-white/25" style={{background:mix}}/>
          <span className="text-[9px] text-gray-400 mt-0.5 font-mono">{mix}</span>
        </div>
      </div>
      {nota&&<p className="text-xs text-gray-500 italic">{nota}</p>}
    </div>
  );
};

// ─── Pequeños helpers de presentación reutilizados en todos los capítulos ────
export const CapP=({children})=>(<p className="text-sm text-gray-300 leading-relaxed mb-3">{children}</p>);

export const CapH3=({children})=>(<h3 className="text-base font-bold text-[#d4d4d4] mt-5 mb-2" style={{fontFamily:"'Libre Baskerville',serif"}}>{children}</h3>);

export const CapNota=({children})=>(
  <div className="rounded-lg p-3 border border-[#333333] my-3" style={{background:"#0a0a0a"}}>
    <p className="text-xs text-[#cfcfcf] leading-relaxed italic">{children}</p>
  </div>
);

export const CapFig=({caption, children})=>(
  <div className="rounded-xl p-4 border border-gray-800 my-4" style={{background:"#121212"}}>
    {children}
    {caption&&<p className="text-xs text-gray-500 italic mt-3 text-center">{caption}</p>}
  </div>
);

export const CapImgPend=({texto})=>(
  <div className="rounded-lg p-3 border border-dashed border-gray-700 my-3" style={{background:"#121212"}}>
    <p className="text-xs text-gray-500 italic">🖼️ Imagen pendiente en el libro — {texto}</p>
  </div>
);

export const ConceptoPar=({a,b,descA,descB})=>(
  <div className="rounded-lg p-3 border border-gray-800" style={{background:"#121212"}}>
    <p className="text-sm font-bold text-[#e6e6e6] italic mb-1">{a} ↔ {b}</p>
    <p className="text-xs text-gray-500 leading-relaxed">{descA}</p>
  </div>
);

export const pasoLabel = d => d===1?"S":d===2?"T":d===3?"T½":String(d);

export const PasoCard=({n,titulo,children,fig})=>(
  <div className="flex gap-3 rounded-xl border p-3 my-2" style={{background:"#121212",borderColor:"#2a2a2a"}}>
    <div className="flex-shrink-0 flex items-center justify-center rounded-full font-black"
      style={{width:30,height:30,background:"#e6e6e6",color:"#0a0a0a",fontFamily:"serif",fontSize:15}}>{n}</div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold mb-1" style={{color:"#d4d4d4"}}>{titulo}</p>
      <p className="text-xs text-gray-400 leading-relaxed">{children}</p>
      {fig ? <div style={{marginTop:10}}>{fig}</div> : null}
    </div>
  </div>
);

export const TiraColores=()=>(
  <div style={{display:"flex",gap:3,width:"100%"}}>
    {CHROMATIC.map(n=>(
      <div key={n} onClick={()=>playTone(n,4,0.6)} style={{flex:1,minWidth:0,cursor:"pointer",textAlign:"center"}}>
        <div style={{height:34,borderRadius:7,background:nc(n),border:"1px solid rgba(255,255,255,.2)"}}/>
        <div style={{fontSize:9,color:"#aaa",fontFamily:"serif",marginTop:3,whiteSpace:"nowrap"}}>{CROM_SIMPLE[n]}</div>
      </div>))}
  </div>
);

export const TarjetasMuestra=()=>(
  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
    {[["C","Do"],["C#","Do♯ / Re♭"],["D","Re"]].map(([n,t])=>(
      <div key={n} onClick={()=>playTone(n,4,0.6)} style={{width:92,borderRadius:10,overflow:"hidden",border:"1px solid #2f2f35",background:"#0e0e10",cursor:"pointer"}}>
        <div style={{height:46,background:nc(n)}}/>
        <div style={{padding:"5px 6px",textAlign:"center",fontFamily:"'Libre Baskerville',serif",fontSize:12,fontWeight:700,color:"#ececec"}}>{t}</div>
      </div>))}
  </div>
);
