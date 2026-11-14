// Piezas de las lecciones de Teoría.

import { useEffect, useRef } from "react";
import { NC } from "../../shared/teoria/color.js";
import { txtSobre } from "../../shared/teoria/etiquetas.js";

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
// ─── TEORÍA BÁSICA: nociones generales para llegar a escalas y acordes en el bandoneón ───
export const TEO_GRADOS_MAYOR=[["I","Tónica"],["II","Supertónica"],["III","Mediante"],["IV","Subdominante"],["V","Dominante"],["VI","Superdominante"],["VII","Sensible"]];

export const TEO_GRADOS_MENOR=[["I","Tónica"],["II","Supertónica"],["III","Mediante"],["IV","Subdominante"],["V","Dominante"],["VI","Superdominante"],["VII","Subtónica"]];

// notas (nombres en inglés) ordenadas hacia arriba: la octava sube cuando la altura baja
export function teoAscender(pcs,base=4){ let oct=base,prev=-1; return pcs.map(pc=>{ if(prev>=0&&pc<=prev) oct++; prev=pc; return {pc,oct}; }); }

export function useTeoSeq(){
  const timers=useRef([]); useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
  const parar=()=>{ timers.current.forEach(clearTimeout); timers.current=[]; };
  const tras=(ms,fn)=>{ timers.current.push(setTimeout(fn,ms)); };
  return {parar,tras};
}

export const teoBox={background:"#121214",border:"1px solid #26262a",borderRadius:14,padding:"14px 16px",marginBottom:12};

export const teoP={fontFamily:"'Crimson Text',Georgia,serif",fontSize:17,lineHeight:1.55,color:"#cfcfd4",margin:"0 0 10px"};

export function TeoNota({pc,txt,sub,size=40}){ const c=WCOL_TEO[pc]; return (
  <div style={{display:"inline-flex",flexDirection:"column",alignItems:"center",gap:3}}>
    <div style={{width:size,height:size,borderRadius:"50%",background:c,border:"2px solid rgba(255,255,255,.3)",display:"flex",alignItems:"center",justifyContent:"center",color:txtSobre(c),fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:size*0.34}}>{txt}</div>
    {sub!==undefined&&<span style={{fontSize:10,color:"#8a8a90",fontFamily:"monospace"}}>{sub}</span>}
  </div>); }

export const WCOL_TEO=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"].map(n=>NC[n]);

export const FigSvg=({id,size=44})=>{ const hueco=id==="redonda"||id==="blanca", asta=id!=="redonda", flags=id==="corchea"?1:id==="semicorchea"?2:0;
  return (<svg width={size} height={size} viewBox="0 0 44 44"><ellipse cx="16" cy="32" rx="9" ry="6.5" transform="rotate(-20 16 32)" fill={hueco?"none":"#ececec"} stroke="#ececec" strokeWidth="2.4"/>
    {asta&&<line x1="24.6" y1="29.5" x2="24.6" y2="6" stroke="#ececec" strokeWidth="2.4"/>}
    {[...Array(flags)].map((_,i)=><path key={i} d={`M24.6,${6+i*7} q10,5 6,16`} fill="none" stroke="#ececec" strokeWidth="2.4"/>)}</svg>); };
