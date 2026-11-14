// El armador de acordes: elegir las piezas y ver el acorde en el teclado.

import { useState, useMemo } from "react";
import { CHROMATIC, nombreLat, noteIdx } from "../teoria/notas.js";
import { nc } from "../teoria/color.js";
import { uiPill, uiPlay } from "../ui/tema.js";
import { playBand } from "../audio/audio.js";
import { itemsMano } from "./tablas.js";
import { ACORDE_BASES, ACORDE_INI, ACORDE_NOV, ACORDE_RAICES, ACORDE_SEPT, ACORDE_TRE, ACORDE_UND } from "./acordes-base.js";
import { txtSobre } from "../teoria/etiquetas.js";
import { calcAcorde } from "./acorde.js";

export function useAcorde(romano=false,setRomano=()=>{}){
  const [ac,setAc]     = useState(ACORDE_INI);
  const [open,setOpen] = useState(false);
  const set   = (k,v)=>setAc(p=>({...p,[k]:v}));
  const reset = ()=>setAc(ACORDE_INI);
  const setAll = (obj)=>setAc({...ACORDE_INI,...obj});
  const calc = useMemo(()=>calcAcorde(ac,romano),[ac,romano]);
  return {ac,set,reset,setAll,open,setOpen,romano,setRomano,...calc,key:JSON.stringify(ac)};
}

const tocarAcordeBand = (A)=>{
  A.tones.forEach((t,i)=>{
    const a = A.rootIdx + t.iv + (t.up?12:0);
    setTimeout(()=>playBand(CHROMATIC[a%12], 3+Math.floor(a/12)), i*35);
  });
};

export function ArmadorAcordes({ a, collapsible=true, children }){
  const UI={bg:"#121212",line:"#2a2a2a",text:"#e6e6e6",mute:"#8a8a8a"};
  const pill=(on)=>uiPill(on);
  const Fila=({titulo,list,campo})=>(
    <div className="mb-3">
      <p style={{fontSize:10,letterSpacing:"0.14em",color:UI.mute,textTransform:"uppercase",marginBottom:6}}>{titulo}</p>
      <div className="flex flex-wrap gap-1.5">
        {list.map(o=>(<button key={o.id} style={pill(a.ac[campo]===o.id)} onClick={()=>a.set(campo,o.id)}>{o.label}</button>))}
      </div>
    </div>
  );
  const abierto = !collapsible || a.open;
  return(
    <div className="rounded-xl mb-3" style={{background:UI.bg,border:`1px solid ${UI.line}`,padding:"10px 12px"}}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div style={{minWidth:0}}>
          <p style={{fontSize:10,letterSpacing:"0.14em",color:UI.mute,textTransform:"uppercase"}}>🎼 Armar acorde</p>
          {(abierto||!collapsible) ? null : <p style={{fontSize:12,color:UI.text,marginTop:2}}>{a.name}</p>}
        </div>
        {collapsible && (
          <button onClick={()=>a.setOpen(!a.open)} style={{...pill(a.open),padding:"5px 12px"}}>{a.open?"Ocultar":"Abrir"}</button>
        )}
      </div>

      {abierto && (
        <div className="mt-3">
          <div className="mb-3">
            <p style={{fontSize:10,letterSpacing:"0.14em",color:UI.mute,textTransform:"uppercase",marginBottom:6}}>1 · Fundamental</p>
            <div className="flex flex-wrap gap-1.5">
              {ACORDE_RAICES.map(x=>(<button key={x} style={pill(a.ac.root===x)} onClick={()=>a.set("root",x)}>{nombreLat(x)}</button>))}
            </div>
          </div>
          <Fila titulo="2 · Tipo de acorde" list={ACORDE_BASES} campo="base"/>
          <Fila titulo="3 · Séptima" list={ACORDE_SEPT} campo="sept"/>
          <div className="grid sm:grid-cols-3 gap-x-4">
            <Fila titulo="4 · Novena" list={ACORDE_NOV} campo="nov"/>
            <Fila titulo="Oncena" list={ACORDE_UND} campo="und"/>
            <Fila titulo="Trecena" list={ACORDE_TRE} campo="tre"/>
          </div>
          <div className="mb-3">
            <p style={{fontSize:10,letterSpacing:"0.14em",color:UI.mute,textTransform:"uppercase",marginBottom:6}}>Extras</p>
            <div className="flex flex-wrap gap-1.5">
              <button style={pill(a.ac.seis)} onClick={()=>a.set("seis",!a.ac.seis)}>Sexta (6)</button>
              <button style={pill(a.ac.sin5)} onClick={()=>a.set("sin5",!a.ac.sin5)}>Sin quinta</button>
              <button style={{...pill(false),marginLeft:"auto"}} onClick={a.reset}>⟳ Limpiar</button>
            </div>
          </div>

          {/* Resultado */}
          <div style={{borderTop:`1px solid ${UI.line}`,paddingTop:10}}>
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <p style={{fontSize:14,fontFamily:"'Libre Baskerville',serif",fontWeight:700,color:UI.text}}>{a.name}</p>
              <button onClick={()=>tocarAcordeBand(a)} style={uiPlay(false,{padding:"7px 14px"})}>▶ Tocar acorde</button>
            </div>
            <div className="flex gap-1.5 mb-2 items-center">
              <span style={{fontSize:10,letterSpacing:"0.14em",color:UI.mute,textTransform:"uppercase",marginRight:4}}>Función</span>
              <button style={pill(a.romano)} onClick={()=>a.setRomano(true)}>I · III · V</button>
              <button style={pill(!a.romano)} onClick={()=>a.setRomano(false)}>1 · 3 · 5</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {a.tones.map(t=>(
                <div key={t.pc} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <div style={{width:44,height:44,borderRadius:10,background:nc(t.pc),border:"2px solid rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",
                    color:txtSobre(nc(t.pc)),fontFamily:"serif",fontWeight:900,fontSize:13}}>{t.nombre}</div>
                  <span style={{fontSize:10,fontFamily:"monospace",color:UI.mute}}>{t.lab}</span>
                </div>
              ))}
            </div>
          </div>
          {children}
        </div>
      )}
    </div>
  );
}

// Voicing recomendado sobre el teclado real (alturas del CSV).
// Mano izquierda: bajo (fundamental más grave) + 7ª justo encima + resto del acorde desde el Do3.
// Mano derecha: las notas del acorde en orden ascendente desde el Do3; la inversión rota qué nota va abajo.
export function armarVoicing(btns, bellows, tones, mano, inv){
  const items=itemsMano(btns,bellows), DO3=48;
  const occ=(pc)=>{ const n=typeof pc==="number"?pc:noteIdx(pc); return items.filter(i=>i.pc===n).sort((a,b)=>a.midi-b.midi); };
  const mk=(it,t,rol)=>({pc:it.pc,oct:it.oct,midi:it.midi,b:it.b.id,esc:t.esc,nombre:t.nombre,lab:t.lab,rol});
  const out=[], faltan=[], es7=(t)=>["b7","7","bb7"].includes(t.raw);
  const raiz=tones[0]; if(!raiz) return {notas:[],faltan:[]};
  let piso=-1;
  const poner=(lista,primeroDesde)=>{ let prev=-1; lista.forEach((t,idx)=>{
      const c=occ(t.pc); const hit = idx===0 ? (c.find(i=>i.midi>=primeroDesde&&i.midi>piso)||c.find(i=>i.midi>piso)) : c.find(i=>i.midi>prev);
      if(hit){ out.push(mk(hit,t,t.lab)); prev=hit.midi; } else faltan.push(t.nombre+" ("+t.lab+")"); }); };
  if(mano==="izq"){
    const r=occ(raiz.pc)[0];
    if(r){ out.push(mk(r,raiz,"Bajo")); piso=r.midi; } else faltan.push(raiz.nombre+" (bajo)");
    const s=tones.find(es7);
    if(s){ const c=occ(s.pc).find(i=>i.midi>piso); if(c){ out.push(mk(c,s,"7ª")); piso=Math.max(piso,c.midi); } else faltan.push(s.nombre+" (7ª)"); }
    let U=tones.filter(t=>t!==raiz&&!es7(t)); const k=U.length?inv%U.length:0; U=[...U.slice(k),...U.slice(0,k)];
    poner(U,DO3);
  } else {
    let T=[...tones]; const k=T.length?inv%T.length:0; T=[...T.slice(k),...T.slice(0,k)];
    poner(T,DO3);
  }
  return {notas:out,faltan};
}

export const octLista=(items,pc)=>{ const n=typeof pc==="number"?pc:noteIdx(pc); const m={}; items.filter(i=>i.pc===n).forEach(i=>{ m[i.oct]=(m[i.oct]||0)+1; });
  return Object.keys(m).map(Number).sort((a,b)=>a-b).map(o=>m[o]>1?`${o}×${m[o]}`:String(o)).join(" · "); };
