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
import { Desplegable } from "../ui/ayudas.jsx";

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

// Armador compacto (pestaña Bandoneón): elegir a la izquierda; resultado y forma sugerida a la derecha, todo a la vista.
// «pegado»: "abajo" o "arriba" deja el panel fijo en la pantalla mientras se mira el teclado (solo con el panel abierto).
export function ArmadorCompacto({ a, pegado=null, children }){
  const UI={bg:"#121214",line:"#2a2a2a",text:"#e6e6e6",mute:"#8a8a8a"};
  const pill=(on)=>uiPill(on,{padding:"4px 11px",fontSize:12});
  const lab={fontSize:10,letterSpacing:"0.14em",color:UI.mute,textTransform:"uppercase",margin:0};
  const sel=(etq,campo,list,ancho)=>(<Desplegable ancho={ancho} etiqueta={etq} valor={a.ac[campo]} opciones={list.map(o=>[o.id,o.label])} onChange={v=>a.set(campo,v)}/>);
  const fijo=!(a.open&&pegado)?{}:pegado==="abajo"
    ?{position:"sticky",bottom:0,zIndex:20,maxHeight:"60vh",overflowY:"auto",boxShadow:"0 -10px 24px rgba(0,0,0,.55)"}
    :{position:"sticky",top:8,zIndex:20,maxHeight:"calc(100vh - 16px)",overflowY:"auto"};
  return(
    <div className="rounded-xl mb-3" style={{background:UI.bg,border:`1px solid ${UI.line}`,padding:"10px 12px",...fijo}}>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div style={{display:"flex",alignItems:"baseline",gap:10,minWidth:0}}>
          <p style={lab}>🎼 Armar acorde</p>
          <p style={{margin:0,fontSize:a.open?16:12,fontFamily:"'Libre Baskerville',serif",fontWeight:700,color:UI.text}}>{a.name}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {a.open && <button onClick={()=>tocarAcordeBand(a)} style={uiPlay(false,{padding:"5px 12px"})}>▶ Tocar acorde</button>}
          {a.open && <button style={pill(false)} onClick={a.reset}>⟳ Limpiar</button>}
          <button onClick={()=>a.setOpen(!a.open)} style={pill(a.open)}>{a.open?"Ocultar":"Abrir"}</button>
        </div>
      </div>

      {a.open && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"10px 18px",marginTop:8}}>
          <div>{children}</div>
          <div>
            <p style={{...lab,marginBottom:6}}>Elegir</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"flex-end"}}>
              <Desplegable ancho={92} etiqueta="Fundamental" valor={a.ac.root} opciones={ACORDE_RAICES.map(x=>[x,nombreLat(x)])} onChange={v=>a.set("root",v)}/>
              {sel("Tipo","base",ACORDE_BASES,112)}
              {sel("Séptima","sept",ACORDE_SEPT,112)}
              {sel("Novena","nov",ACORDE_NOV,64)}
              {sel("Oncena","und",ACORDE_UND,64)}
              {sel("Trecena","tre",ACORDE_TRE,64)}
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center",marginTop:8}}>
              <button style={pill(a.ac.seis)} onClick={()=>a.set("seis",!a.ac.seis)}>Sexta (6)</button>
              <button style={pill(a.ac.sin5)} onClick={()=>a.set("sin5",!a.ac.sin5)}>Sin quinta</button>
              <span style={{...lab,marginLeft:8}}>Función</span>
              <button style={pill(a.romano)} onClick={()=>a.setRomano(true)}>I · III · V</button>
              <button style={pill(!a.romano)} onClick={()=>a.setRomano(false)}>1 · 3 · 5</button>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
              {a.tones.map(t=>(
                <div key={t.pc} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <div style={{width:34,height:34,borderRadius:9,background:nc(t.pc),border:"2px solid rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",
                    color:txtSobre(nc(t.pc)),fontFamily:"serif",fontWeight:900,fontSize:11}}>{t.nombre}</div>
                  <span style={{fontSize:10,fontFamily:"monospace",color:UI.mute}}>{t.lab}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Voicing recomendado sobre el teclado real (alturas del CSV).
// Mano izquierda (marcato): BAJO = la fundamental (de preferencia en la octava 2) y, arriba, un RELLENO CERRADO
//   que arranca cerca del Re4 y se apila hacia arriba sin saltos; la quinta se omite cuando el acorde tiene séptima
//   o sexta (Do△7 = Do2 + Mi4 + Si4; Sol7 = Sol2 + Fa4 + Si4; Do = Do2 + Mi4 + Sol4 + Do5). La inversión rota qué nota
//   del relleno va abajo. Si el teclado no llega, el relleno baja de octava.
// Mano derecha: las notas del acorde en orden ascendente desde el Do3; la inversión rota qué nota va abajo.
const BAJO_REG=[36,47];   // Do2..Si2: donde prefiere caer el bajo
const RELLENO_PISO=62;    // Re4: el relleno arranca con la primera nota del acorde que esté a partir de acá
const mod12=(n)=>((n%12)+12)%12;

// Las notas que van arriba del bajo en la mano izquierda: con 7ª/6ª/extensiones, sin fundamental y sin quinta justa;
// en una tríada, 3ª + 5ª + la fundamental arriba (Do = Mi, Sol, Do).
export const rellenoIzq=(tones)=>{
  const [raiz,...resto]=tones; if(!raiz) return [];
  return resto.length>=3 ? resto.filter(t=>t.raw!=="5") : [...resto,raiz];   // tríada: cierra con la fundamental arriba
};

export function armarVoicing(btns, bellows, tones, mano, inv){
  const items=itemsMano(btns,bellows), DO3=48;
  const occ=(pc)=>{ const n=typeof pc==="number"?pc:noteIdx(pc); return items.filter(i=>i.pc===n).sort((a,b)=>a.midi-b.midi); };
  const mk=(it,t,rol)=>({pc:it.pc,oct:it.oct,midi:it.midi,b:it.b.id,esc:t.esc,nombre:t.nombre,lab:t.lab,rol});
  const out=[], faltan=[];
  const raiz=tones[0]; if(!raiz) return {notas:[],faltan:[]};
  if(mano==="izq"){
    const c=occ(raiz.pc);
    const bajo=c.find(i=>i.midi>=BAJO_REG[0]&&i.midi<=BAJO_REG[1])||c[0];
    if(bajo) out.push(mk(bajo,raiz,"Bajo")); else faltan.push(raiz.nombre+" (bajo)");
    const R=rellenoIzq(tones);
    if(R.length){
      // anillo ordenado por altura a partir del Re4: la 1ª nota es la más cercana hacia arriba
      const anillo=[...R].sort((x,y)=>mod12(noteIdx(x.pc)-RELLENO_PISO)-mod12(noteIdx(y.pc)-RELLENO_PISO));
      const k=inv%anillo.length, orden=[...anillo.slice(k),...anillo.slice(0,k)];
      const suelo=bajo?bajo.midi:-1;
      let mejor=null;
      for(let j=0;j<4;j++){                         // j = cuántas octavas bajamos si el teclado no llega
        const desde=RELLENO_PISO+mod12(noteIdx(orden[0].pc)-RELLENO_PISO)-12*j;
        const notas=[], falta=[]; let prev=Math.max(desde-1,suelo);
        orden.forEach(t=>{ const hit=occ(t.pc).find(i=>i.midi>prev);
          if(hit){ notas.push(mk(hit,t,t.lab)); prev=hit.midi; } else falta.push(t.nombre+" ("+t.lab+")"); });
        const ancho=notas.length?notas[notas.length-1].midi-notas[0].midi:0;
        const sc=[falta.length,ancho,j];
        if(!mejor||sc[0]<mejor.sc[0]||(sc[0]===mejor.sc[0]&&(sc[1]<mejor.sc[1]||(sc[1]===mejor.sc[1]&&sc[2]<mejor.sc[2])))) mejor={notas,falta,sc};
      }
      out.push(...mejor.notas); faltan.push(...mejor.falta);
    }
  } else {
    let T=[...tones]; const k=T.length?inv%T.length:0; T=[...T.slice(k),...T.slice(0,k)];
    let prev=-1; T.forEach((t,idx)=>{
      const c=occ(t.pc); const hit = idx===0 ? (c.find(i=>i.midi>=DO3)||c[0]) : c.find(i=>i.midi>prev);
      if(hit){ out.push(mk(hit,t,t.lab)); prev=hit.midi; } else faltan.push(t.nombre+" ("+t.lab+")"); });
  }
  return {notas:out,faltan};
}

export const octLista=(items,pc)=>{ const n=typeof pc==="number"?pc:noteIdx(pc); const m={}; items.filter(i=>i.pc===n).forEach(i=>{ m[i.oct]=(m[i.oct]||0)+1; });
  return Object.keys(m).map(Number).sort((a,b)=>a-b).map(o=>m[o]>1?`${o}×${m[o]}`:String(o)).join(" · "); };
