// La pestaña Teoría.

import { useState } from "react";
import { TeoL1, TeoL2, TeoL3, TeoL4, TeoL5, TeoL6 } from "./lecciones.jsx";
import { uiPill } from "../../shared/ui/tema.js";

export function TeoriaTab({irA}){
  const [lec,setLec]=useState(0);
  const LEC=[["Qué es la música",<TeoL1/>],["Figuras y valores",<TeoL2/>],["Las notas",<TeoL3/>],["Cómo se forma una escala",<TeoL4/>],["Cómo se forma un acorde",<TeoL5 irA={irA}/>],["Ahora, en el bandoneón",<TeoL6 irA={irA}/>]];
  return (
    <div>
      <div style={{marginBottom:12}}>
        <h2 style={{margin:0,fontFamily:"'Libre Baskerville',serif",fontSize:22,fontWeight:700,color:"#ececec"}}>📚 Teoría básica</h2>
        <p style={{margin:"4px 0 0",fontSize:12,color:"#8a8a90"}}>Nociones generales, para llegar a las escalas y los acordes. Tu profesor las amplía.</p>
      </div>
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
        {LEC.map(([t],i)=>(<button key={t} style={uiPill(lec===i,{padding:"6px 12px",fontSize:12})} onClick={()=>setLec(i)}>{i+1} · {t}</button>))}
      </div>
      <div key={lec}>
        <h3 style={{margin:"0 0 10px",fontFamily:"'Libre Baskerville',serif",fontSize:19,color:"#ececec"}}>{lec+1}. {LEC[lec][0]}</h3>
        {LEC[lec][1]}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
        <button disabled={lec===0} style={{...uiPill(false,{padding:"7px 16px"}),opacity:lec===0?.4:1}} onClick={()=>setLec(l=>Math.max(0,l-1))}>← Anterior</button>
        <button disabled={lec===LEC.length-1} style={{...uiPill(true,{padding:"7px 18px"}),opacity:lec===LEC.length-1?.4:1}} onClick={()=>setLec(l=>Math.min(LEC.length-1,l+1))}>Siguiente →</button>
      </div>
    </div>
  );
}
