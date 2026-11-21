// Dónde cae el acorde en cada mano: disponibilidad, anchos y disposición.

import { useState, useEffect, useCallback, useRef } from "react";
import { octLista } from "./armador.jsx";
import { CHROMATIC } from "../teoria/notas.js";
import { UI_FONT, uiMarcar, uiPill, uiPlay, uiVista } from "../ui/tema.js";
import { playBand } from "../audio/audio.js";
import { itemsMano } from "./tablas.js";
import { Nota, NotaDot } from "../ui/teoria/notas.jsx";
import { BTN_SIZE } from "./layouts.js";
import { CLAVES } from "../claves.js";

// Un color por función, para distinguir de un vistazo qué es cada grupo de botones
export const COLORES={ fuelle:"#38bdf8", vista:"#9aa3ad", marcar:"#f472b6", acorde:"#2dd4bf", voicing:"#f5b14c", escuchar:"#a78bfa", mapa:"#60a5fa", teclado:"#9aa3ad" };
// Pinta de «color» un botón activo; el que no está activo queda como estaba
export const acento=(estilo,color,on)=>on?{...estilo,background:color+"2b",borderColor:color,color:"#fff"}:estilo;

// El voicing sugerido para el acorde (una sola forma, según con qué mano y de qué manera se quiera tocar) y, plegado,
// dónde está cada nota del acorde en el teclado. Sin «voz» (otras pantallas) muestra solo dónde está cada nota.
export function DisponibilidadAcorde({ tones, leftBtns, rightBtns, bellows, voz }){
  const cols=[["izq","abre","IZQ ▷",leftBtns],["izq","cierra","IZQ ◁",leftBtns],["der","abre","DER ▷",rightBtns],["der","cierra","DER ◁",rightBtns]];
  const itemsDe={}; cols.forEach(c=>{ itemsDe[c[0]+c[1]]=itemsMano(c[3],c[1]); });
  const sec={fontSize:10,letterSpacing:"0.14em",color:"#8a8a8a",textTransform:"uppercase",marginBottom:8,fontWeight:600,fontFamily:UI_FONT};
  const lbl={fontSize:11,color:"#8a8a8a",marginRight:2};
  const peq=(on,extra)=>acento(uiPill(on,{padding:"5px 12px",fontSize:12,...extra}),COLORES.voicing,on);
  const tabla=(
    <div>
      <div className="overflow-x-auto">
        <table style={{borderCollapse:"collapse",fontSize:12,fontFamily:"monospace",width:"100%"}}>
          <thead><tr>
            <th style={{textAlign:"left",padding:"3px 6px",color:"#8a8a8a",fontWeight:600}}>Nota</th>
            {cols.map(c=>(<th key={c[2]} style={{padding:"3px 6px",color:c[1]===bellows?"#e6e6e6":"#555",fontWeight:700}}>{c[2]}</th>))}
          </tr></thead>
          <tbody>
            {tones.map(t=>(
              <tr key={t.pc} style={{borderTop:"1px solid #1a1a1a"}}>
                <td style={{padding:"4px 6px",whiteSpace:"nowrap"}}><NotaDot note={t.esc} size={20}/> <span style={{color:"#8a8a8a",marginLeft:4}}>{t.lab}</span></td>
                {cols.map(c=>{ const l=octLista(itemsDe[c[0]+c[1]],t.pc); return(
                  <td key={c[2]} style={{textAlign:"center",padding:"4px 6px",color:l?(c[1]===bellows?"#e6e6e6":"#8a8a8a"):"#444"}}>{l||"—"}</td>
                );})}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{fontSize:10,color:"#555",margin:"6px 0 4px",lineHeight:1.5}}>Los números son las octavas donde existe esa nota (2×3 = dos teclas en la octava 3). Columna clara = fuelle actual.</p>
    </div>
  );
  if(!voz) return(
    <div className="mt-3" style={{borderTop:"1px solid #2a2a2a",paddingTop:10}}>
      <p style={sec}>Dónde está cada nota (octavas disponibles)</p>
      {tabla}
    </div>
  );

  const res=voz.res, ambas=voz.mano==="ambas", forma=voz.forma||"cerrada", nv=res.variantes||1;
  const chip=(n,i)=>(
    <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,minWidth:58,padding:"6px 6px 5px",borderRadius:10,background:"#0e0e10",border:`1px solid ${COLORES.voicing}55`}}>
      <NotaDot note={n.esc} size={30}/>
      <span style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:13,color:"#ececec"}}>{n.nombre}{n.oct}</span>
      <span style={{fontSize:10,color:"#a0a0a6"}}>{n.rol}</span>
      <span style={{fontSize:9,fontFamily:"monospace",color:"#6a6a70"}}>tecla {n.b}</span>
    </div>
  );
  const grupo=(titulo,lista)=>(lista.length>0&&(
    <div key={titulo||"x"} style={{marginBottom:6}}>
      {titulo && <p style={{fontSize:10,letterSpacing:"0.12em",color:"#8a8a8a",textTransform:"uppercase",margin:"0 0 5px"}}>{titulo}</p>}
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>{lista.map(chip)}</div>
    </div>
  ));
  return(
    <div className="mt-3" style={{borderTop:`3px solid ${COLORES.voicing}`,paddingTop:10}}>
      <p style={{...sec,color:COLORES.voicing}}>● Voicing sugerido</p>
      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-3 items-center">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span style={lbl}>Tocar con</span>
          {[["izq","Izquierda"],["der","Derecha"],["ambas","Las dos manos"]].map(([m,l])=>(<button key={m} style={peq(voz.mano===m)} onClick={()=>voz.setMano(m)}>{l}</button>))}
        </div>
        {voz.setForma && (
          <div className="flex flex-wrap gap-1.5 items-center">
            <span style={lbl}>Forma</span>
            <button style={peq(forma==="cerrada")} onClick={()=>voz.setForma("cerrada")}>Cerrada</button>
            <button style={peq(forma==="abierta",ambas?{}:{opacity:0.4,cursor:"not-allowed"})} disabled={!ambas}
              title={ambas?"Bajo y quinta a la izquierda, tercera y séptima a la derecha":"La forma abierta usa las dos manos"} onClick={()=>voz.setForma("abierta")}>Abierta</button>
          </div>
        )}
      </div>
      {res.notas.length>0 ? (
        <div style={{marginBottom:8}}>
          {ambas ? (<>{grupo("Izquierda",res.notas.filter(n=>n.mano==="izq"))}{grupo("Derecha",res.notas.filter(n=>n.mano==="der"))}</>)
                 : grupo(null,res.notas)}
        </div>
      ) : <p style={{fontSize:12,color:"#c9a25a",margin:"0 0 8px"}}>Con este fuelle no hay notas del acorde para armar con esta elección.</p>}
      {res.faltan.length>0 && <p style={{fontSize:11.5,color:"#c9a25a",margin:"0 0 8px"}}>⚠ No hay con este fuelle: {res.faltan.join(", ")}. Probá el otro sentido del fuelle u otra elección.</p>}
      {res.opcional && res.opcional.length>0 && <p style={{fontSize:11.5,color:"#a0a0a6",margin:"0 0 8px"}}>Opcional: {res.opcional.join(", ")}.</p>}
      <div className="flex flex-wrap gap-1.5 items-center">
        <button style={uiPlay(false,{padding:"6px 14px"})} onClick={()=>res.notas.forEach((n,i)=>setTimeout(()=>playBand(CHROMATIC[n.pc],n.oct),i*45))}>▶ Tocar este voicing</button>
        {nv>1 && <button style={uiPill(false,{padding:"6px 14px"})} onClick={()=>voz.setInv(((voz.inv||0)+1)%nv)} title="Otras formas: la otra inversión, el bajo una octava arriba y versiones más agudas">Otra forma ▸ ({(voz.inv||0)%nv+1} de {nv})</button>}
        <button style={uiPill(voz.solo,{padding:"6px 14px"})} onClick={()=>voz.setSolo(!voz.solo)}>{voz.solo?"Mostrando solo estas teclas":"Resaltar solo estas teclas"}</button>
        {voz.onMarcar && res.notas.length>0 && <button style={uiMarcar(false)} onClick={voz.onMarcar} title="Pasa estas notas a Notas marcadas, para escucharlas y modificarlas sobre el teclado">◎ Marcar estas teclas</button>}
      </div>
      {nv>1 && <p style={{fontSize:11.5,color:COLORES.voicing,margin:"8px 0 0"}}>Forma {(voz.inv||0)%nv+1} de {nv}: {res.desc||"la recomendada"}</p>}
      {res.texto && <p style={{fontSize:10.5,color:"#6a6a70",margin:"8px 0 0",lineHeight:1.5}}>{res.texto}</p>}

      <details style={{marginTop:12,borderTop:"1px solid #1e1e1e",paddingTop:8}}>
        <summary style={{cursor:"pointer",fontSize:11,color:"#8a8a8a",letterSpacing:"0.04em"}}>Ver todas las notas del acorde y dónde está cada una</summary>
        <div style={{marginTop:8}}>{tabla}</div>
      </details>
    </div>
  );
}

// Mide el ancho real de un contenedor aunque aparezca después (p. ej. tras cargar los botones).
export function useAnchoMedido(){
  const [w,setW]=useState(0);
  const roRef=useRef(null);
  const ref=useCallback((el)=>{
    if(roRef.current){ roRef.current.disconnect(); roRef.current=null; }
    if(!el) return;
    const upd=()=>setW(Math.floor(el.getBoundingClientRect().width)||el.clientWidth||0);
    upd();
    if(typeof ResizeObserver!=="undefined"){ const ro=new ResizeObserver(upd); ro.observe(el); roRef.current=ro; }
  },[]);
  return [ref,w];
}

// ─── DISPOSICIÓN DE LOS TECLADOS: lado a lado (izquierda a la izquierda) o apilados ─────────
const anchoMano = (btns)=> btns.length ? Math.max(...btns.map(b=>b.x))+BTN_SIZE+16 : 740;

export function useDisposicion(){
  const [lado,setLadoS]=useState(()=>{ try{ return localStorage.getItem(CLAVES.lado)!=="0"; }catch(e){ return true; } });
  const setLado=(v)=>{ setLadoS(v); try{ localStorage.setItem(CLAVES.lado,v?"1":"0"); }catch(e){} };
  const [full,setFull]=useState(false);
  const [invertir,setInvertirS]=useState(()=>{ try{ return localStorage.getItem(CLAVES.invertir)==="1"; }catch(e){ return false; } });
  const setInvertir=(v)=>{ setInvertirS(v); try{ localStorage.setItem(CLAVES.invertir,v?"1":"0"); }catch(e){} };
  useEffect(()=>{
    const f=()=>setFull(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange",f);
    return ()=>document.removeEventListener("fullscreenchange",f);
  },[]);
  const toggleFull=()=>{ try{ if(document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); }catch(e){} };
  return {lado,setLado,full,toggleFull,invertir,setInvertir};
}

// Con ambos teclados y modo "lado a lado", los dos usan la misma escala y llenan todo el ancho.
export function calcAnchos(wrapWidth,L,R,ambas,lado,isMobile){
  const gap=14, WL=anchoMano(L), WR=anchoMano(R), k=(wrapWidth-gap)/(WL+WR);
  if(ambas && lado && !isMobile) return {fila:true,gap,aL:Math.floor(WL*k),aR:Math.floor(WR*k)};
  if(isMobile) return {fila:false,gap:18,aL:wrapWidth,aR:wrapWidth};
  // Apilados (o una sola mano): apenas más grandes que lado a lado, sin ocupar todo el ancho
  const f=1.15;
  return {fila:false,gap:18,aL:Math.min(wrapWidth,Math.floor(WL*k*f)),aR:Math.min(wrapWidth,Math.floor(WR*k*f))};
}

export function ControlesDisposicion({d,isMobile}){
  const on=(v)=>uiVista(v);
  return(
    <div style={{display:"flex",background:"#121212",border:"1.5px solid #333333",borderRadius:10,padding:3,gap:2}}>
      {!isMobile && <button style={on(d.lado)} onClick={()=>d.setLado(true)} title="Izquierda a la izquierda, derecha a la derecha">◫ Lado a lado</button>}
      {!isMobile && <button style={on(!d.lado)} onClick={()=>d.setLado(false)} title="Uno debajo del otro, más grandes">☰ Apilados</button>}
      {(isMobile||!d.lado) && <button style={on(d.invertir)} onClick={()=>d.setInvertir(!d.invertir)} title="Apilados: derecha arriba e izquierda abajo">⇅ Derecha arriba</button>}
      <button style={on(d.full)} onClick={d.toggleFull} title="Usa toda la pantalla">{d.full?"⛶ Salir":"⛶ Pantalla completa"}</button>
    </div>
  );
}
