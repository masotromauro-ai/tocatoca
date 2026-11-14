// Botón base y grilla de botones.

import { LAT } from "../teoria/notas.js";
import { nc } from "../teoria/color.js";
import { OCT_C } from "./tablas.js";

// Botón del bandoneón
const BBtn=({noteLat,oct,pressed,onDown,onUp,size=38})=>{
  const oc=OCT_C[oct]||{bg:"#555",border:"#333"};
  const eng=LAT[noteLat]||noteLat;
  const tc=nc(eng);
  return(
    <button
      onMouseDown={()=>onDown(noteLat,oct)}
      onMouseUp={()=>onUp(noteLat,oct)}
      onMouseLeave={()=>onUp(noteLat,oct)}
      onTouchStart={e=>{e.preventDefault();onDown(noteLat,oct);}}
      onTouchEnd={e=>{e.preventDefault();onUp(noteLat,oct);}}
      className="rounded-full flex flex-col items-center justify-center select-none flex-shrink-0"
      style={{
        width:size,height:size,
        background:pressed
          ?`radial-gradient(circle at 35% 35%,${tc},${tc}aa)`
          :`radial-gradient(circle at 35% 35%,${oc.bg}ee,${oc.bg}88)`,
        border:`2px solid ${pressed?tc:oc.border}`,
        boxShadow:pressed?`0 0 10px ${tc}88,inset 0 1px 3px rgba(255,255,255,0.4)`:`0 3px 6px rgba(0,0,0,0.6)`,
        transform:pressed?"scale(0.93)":"scale(1)",
        transition:"all 0.07s ease",cursor:"pointer",
      }}>
      <span style={{fontSize:size<36?"6.5px":"7.5px",fontWeight:"bold",color:pressed?"#fff":"rgba(0,0,0,0.9)",lineHeight:1}}>{noteLat}</span>
      <span style={{fontSize:"5.5px",color:pressed?"rgba(255,255,255,0.7)":"rgba(0,0,0,0.5)"}}>{oct}</span>
    </button>
  );
};

const BGrid=({layout,pressed,onDown,onUp,title,size=36})=>(
  <div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 text-center">{title}</p>
    <div className="inline-block p-3 rounded-2xl"
      style={{background:"linear-gradient(145deg,#1d1d1d,#101010)",border:"2px solid #3a3a3a",boxShadow:"0 8px 24px rgba(0,0,0,0.7)"}}>
      {layout.map((row,ri)=>(
        <div key={ri} className="flex gap-1 mb-1" style={{marginLeft:ri%2===1?(size+4)/2+"px":"0px"}}>
          {row.map((btn,bi)=>{
            const pr=pressed.some(p=>p.ri===ri&&p.bi===bi);
            return<BBtn key={`${ri}-${bi}`} noteLat={btn.n} oct={btn.o}
              pressed={pr}
              onDown={(n,o)=>onDown({n,o,ri,bi})}
              onUp={()=>onUp({ri,bi})}
              size={size}/>;
          })}
        </div>
      ))}
      <div className="flex gap-2 mt-2 justify-center flex-wrap">
        {[...new Set(layout.flat().map(b=>b.o))].sort().map(oct=>{
          const c=OCT_C[oct];if(!c)return null;
          return(<div key={oct} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full" style={{background:c.bg,border:`1px solid ${c.border}`}}/>
            <span style={{fontSize:"8px",color:"#777"}}>Oct.{oct}</span>
          </div>);
        })}
      </div>
    </div>
  </div>
);

// ─── TABLAS DE OCTAVAS — generadas dinámicamente desde los datos de cada botón ──
// Al editar el teclado, oct_abre/oct_cierra en cada botón actualiza estas tablas.
// Fuente inicial: Rheinische 142 (behinger.github.io/bandoneon)
