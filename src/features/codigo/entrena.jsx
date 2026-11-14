// El entrenador de colores de El Código.

import { useState } from "react";
import { NOMBRES_PC } from "../../shared/ui/codigo/paleta.jsx";
import { medir } from "../../shared/medicion.js";
import { CHROMATIC } from "../../shared/teoria/notas.js";
import { nc } from "../../shared/teoria/color.js";
import { uiLabel, uiPill } from "../../shared/ui/tema.js";
import { playBand } from "../../shared/audio/audio.js";
import { txtSobre } from "../../shared/teoria/etiquetas.js";

// ─── ENTRENADOR DE COLORES (antes de llegar al bandoneón) ────────────────────
export function EntrenaColores(){
  const [modo,setModo]=useState("nota");              // nota → color | color → nota | orden
  const [Q,setQ]=useState(null);                       // ronda de preguntas
  const [ord,setOrd]=useState(null);                   // modo orden
  const mezcla=(a)=>{ const r=[...a]; for(let i=r.length-1;i>0;i--){ const j=Math.random()*(i+1)|0; [r[i],r[j]]=[r[j],r[i]]; } return r; };
  const nueva=()=>setQ({i:0,ok:0,lista:[...Array(10)].map(()=>Math.random()*12|0),resp:null});
  const nuevaOrden=()=>setOrd({mezcla:mezcla([...Array(12).keys()]),sig:0,err:0,pista:false,mal:null});
  const cambiar=(m)=>{ setModo(m); setQ(null); setOrd(null); };

  const responder=(pc)=>{ if(Q.resp!==null) return; const bien=pc===Q.lista[Q.i]; playBand(CHROMATIC[Q.lista[Q.i]],4); medir("preguntas-"+modo,bien,Q.lista[Q.i]);
    setQ(q=>q?{...q,resp:pc,ok:q.ok+(bien?1:0)}:q); setTimeout(()=>setQ(q=>q?{...q,i:q.i+1,resp:null}:q),bien?750:1500); };
  const tocarOrden=(pc)=>{ if(ord.sig>=12) return;
    if(pc===ord.sig){ playBand(CHROMATIC[pc],4); setOrd(o=>({...o,sig:o.sig+1,pista:false,mal:null})); }
    else { setOrd(o=>({...o,err:o.err+1,mal:pc})); setTimeout(()=>setOrd(o=>o?({...o,mal:null}):o),600); } };

  const card={background:"#121214",border:"1px solid #26262a",borderRadius:14,padding:"16px 14px"};
  const colorBtn=(pc,extra)=>{ const col=nc(CHROMATIC[pc]); return {aspectRatio:"1",borderRadius:12,border:"2px solid rgba(255,255,255,.22)",background:col,cursor:"pointer",...extra}; };

  return(
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {[["nota","Nota → color"],["color","Color → nota"],["orden","Ordená la paleta"]].map(([v,l])=>(<button key={v} style={uiPill(modo===v,{padding:"7px 14px"})} onClick={()=>cambiar(v)}>{l}</button>))}
      </div>

      {modo!=="orden" && !Q && (
        <div style={{...card,textAlign:"center"}}>
          <p style={{fontFamily:"'Libre Baskerville',serif",fontSize:17,fontWeight:700,margin:"0 0 6px"}}>{modo==="nota"?"¿De qué color es esta nota?":"¿Qué nota es este color?"}</p>
          <p style={{fontSize:12.5,color:"#8a8a90",margin:"0 0 14px"}}>10 preguntas. Se corrige sola y suena cada nota.</p>
          <button style={uiPill(true,{padding:"9px 22px"})} onClick={nueva}>Empezar</button>
        </div>
      )}
      {modo!=="orden" && Q && Q.i>=Q.lista.length && (
        <div style={{...card,textAlign:"center"}}>
          <p style={uiLabel}>Resultado</p>
          <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:54,fontWeight:700,margin:"4px 0"}}>{Q.ok}<span style={{fontSize:26,color:"#6a6a70"}}>/{Q.lista.length}</span></div>
          <p style={{fontSize:13,color:"#a0a0a6",margin:"0 0 14px"}}>{Q.ok===Q.lista.length?"Perfecto: ya sabés la paleta.":Q.ok>=8?"Muy bien, casi.":"Seguí con la rueda de arriba y volvé a intentar."}</p>
          <button style={uiPill(true,{padding:"9px 22px"})} onClick={nueva}>Repetir</button>
        </div>
      )}
      {modo!=="orden" && Q && Q.i<Q.lista.length && (()=>{ const pc=Q.lista[Q.i]; return(
        <div style={card}>
          <p style={{...uiLabel,textAlign:"center",marginBottom:10}}>Pregunta {Q.i+1} de {Q.lista.length} · aciertos {Q.ok}</p>
          {modo==="nota" ? (
            <div style={{fontFamily:"'Libre Baskerville',serif",fontSize:46,fontWeight:700,textAlign:"center",marginBottom:14}}>{NOMBRES_PC[pc]}</div>
          ) : (
            <div style={{width:96,height:96,borderRadius:"50%",background:nc(CHROMATIC[pc]),border:"3px solid rgba(255,255,255,.4)",margin:"0 auto 16px",boxShadow:`0 0 28px ${nc(CHROMATIC[pc])}88`}}/>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8}}>
            {[...Array(12).keys()].map(k=>{
              const esC=Q.resp!==null&&k===pc, esM=Q.resp===k&&k!==pc;
              const out=esC?"4px solid #6b9c7c":esM?"4px solid #c0615a":"none";
              return modo==="nota" ? (
                <button key={k} onClick={()=>responder(k)} style={colorBtn(k,{outline:out,outlineOffset:2})}/>
              ) : (
                <button key={k} onClick={()=>responder(k)} style={{...uiPill(false,{padding:"10px 2px",fontSize:12,textAlign:"center"}),outline:out,outlineOffset:2,borderColor:"#3a3a3e"}}>{NOMBRES_PC[k].replace(" / ","/")}</button>
              );
            })}
          </div>
          <p style={{fontSize:12,textAlign:"center",color:"#8a8a90",minHeight:20,margin:"12px 0 0"}}>{Q.resp===null?"":(Q.resp===pc?"¡Correcto!":`No: era ${NOMBRES_PC[pc]}`)}</p>
        </div>); })()}

      {modo==="orden" && !ord && (
        <div style={{...card,textAlign:"center"}}>
          <p style={{fontFamily:"'Libre Baskerville',serif",fontSize:17,fontWeight:700,margin:"0 0 6px"}}>Ordená los doce colores</p>
          <p style={{fontSize:12.5,color:"#8a8a90",margin:"0 0 14px"}}>Tocalos en orden cromático, empezando por Do y subiendo de a semitono hasta Si. Si te trabás, pedí una pista.</p>
          <button style={uiPill(true,{padding:"9px 22px"})} onClick={nuevaOrden}>Empezar</button>
        </div>
      )}
      {modo==="orden" && ord && (
        <div style={card}>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <p style={{...uiLabel,margin:0}}>{ord.sig>=12?"¡Completo!":`Buscá el color n.º ${ord.sig+1}`} · errores {ord.err}</p>
            <div className="flex gap-2">
              {ord.sig<12 && <button style={uiPill(ord.pista,{padding:"5px 12px"})} onClick={()=>setOrd(o=>({...o,pista:!o.pista}))}>💡 Pista</button>}
              <button style={uiPill(false,{padding:"5px 12px"})} onClick={nuevaOrden}>Mezclar de nuevo</button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8}}>
            {ord.mezcla.map(pc=>{
              const puesto=pc<ord.sig, esProx=ord.pista&&pc===ord.sig, mal=ord.mal===pc;
              return(
                <button key={pc} onClick={()=>tocarOrden(pc)} style={colorBtn(pc,{opacity:puesto?1:0.95,outline:mal?"4px solid #c0615a":esProx?"4px dashed #fff":puesto?"3px solid #6b9c7c":"none",outlineOffset:2,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:txtSobre(nc(CHROMATIC[pc])),fontFamily:"serif",fontWeight:900,lineHeight:1.1})}>
                  {puesto && <><span style={{fontSize:16}}>{NOMBRES_PC[pc].split(" ")[0]}</span><span style={{fontSize:10,fontFamily:"monospace",opacity:.8}}>{pc+1}</span></>}
                </button>
              );
            })}
          </div>
          {ord.sig>=12 && <p style={{fontSize:13,color:"#6b9c7c",margin:"12px 0 0",textAlign:"center"}}>Orden completo con {ord.err} error{ord.err===1?"":"es"}. Repetilo hasta que salga sin errores.</p>}
        </div>
      )}
    </div>
  );
}
