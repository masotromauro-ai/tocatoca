// Dónde cae el acorde en cada mano: disponibilidad, anchos y disposición.

import { useState, useEffect, useCallback, useRef } from "react";
import { octLista, rellenoIzq } from "./armador.jsx";
import { CHROMATIC } from "../teoria/notas.js";
import { UI_FONT, uiMarcar, uiPill, uiPlay, uiVista } from "../ui/tema.js";
import { playBand } from "../audio/audio.js";
import { itemsMano } from "./tablas.js";
import { Nota, NotaDot } from "../ui/teoria/notas.jsx";
import { BTN_SIZE } from "./layouts.js";
import { CLAVES } from "../claves.js";

// Dónde está cada nota del acorde (por octava) y cómo armarlo
export function DisponibilidadAcorde({ tones, leftBtns, rightBtns, bellows, voz }){
  const cols=[["izq","abre","IZQ ▷",leftBtns],["izq","cierra","IZQ ◁",leftBtns],["der","abre","DER ▷",rightBtns],["der","cierra","DER ◁",rightBtns]];
  const itemsDe={}; cols.forEach(c=>{ itemsDe[c[0]+c[1]]=itemsMano(c[3],c[1]); });
  const sec={fontSize:10,letterSpacing:"0.14em",color:"#8a8a8a",textTransform:"uppercase",marginBottom:8,fontWeight:600,fontFamily:UI_FONT};
  const peq=(on)=>uiPill(on,{padding:"4px 10px",fontSize:11});
  return(
    <div className="mt-3" style={{borderTop:"1px solid #2a2a2a",paddingTop:10}}>
      <p style={sec}>Dónde está cada nota (octavas disponibles)</p>
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
      <p style={{fontSize:10,color:"#555",margin:"6px 0 12px",lineHeight:1.5}}>Los números son las octavas donde existe esa nota (2×3 = dos teclas en la octava 3). Columna clara = fuelle actual.</p>

      {voz && (<>
        <p style={sec}>Cómo armarlo · voicing recomendado</p>
        <div className="flex flex-wrap gap-1.5 mb-2 items-center">
          <span style={{fontSize:11,color:"#8a8a8a",marginRight:4}}>Mano</span>
          <button style={peq(voz.mano==="izq")} onClick={()=>{voz.setMano("izq");voz.setInv(0);}}>Izquierda</button>
          <button style={peq(voz.mano==="der")} onClick={()=>{voz.setMano("der");voz.setInv(0);}}>Derecha</button>
          <span style={{width:10}}/>
          <span style={{fontSize:11,color:"#8a8a8a",marginRight:4}}>Inversión</span>
          {["Fundamental","1ª","2ª","3ª"].slice(0,Math.max(1,Math.min(4,voz.mano==="izq"?rellenoIzq(tones).length:tones.length))).map((l,i)=>(<button key={i} style={peq(voz.inv===i)} onClick={()=>voz.setInv(i)}>{l}</button>))}
        </div>
        {voz.res.notas.length>0 ? (
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
            {voz.res.notas.map((n,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,minWidth:58,padding:"6px 6px 5px",borderRadius:10,background:"#0e0e10",border:"1px solid #26262a"}}>
                <NotaDot note={n.esc} size={30}/>
                <span style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:13,color:"#ececec"}}>{n.nombre}{n.oct}</span>
                <span style={{fontSize:10,color:"#a0a0a6"}}>{n.rol}</span>
                <span style={{fontSize:9,fontFamily:"monospace",color:"#6a6a70"}}>tecla {n.b}</span>
              </div>
            ))}
          </div>
        ) : <p style={{fontSize:12,color:"#c9a25a",margin:"0 0 8px"}}>Con este fuelle y esta mano no hay notas del acorde para armar.</p>}
        {voz.res.faltan.length>0 && <p style={{fontSize:11.5,color:"#c9a25a",margin:"0 0 8px"}}>⚠ No hay en esta mano y con este fuelle: {voz.res.faltan.join(", ")}. Probá el otro sentido del fuelle, la otra mano u otra inversión.</p>}
        <div className="flex flex-wrap gap-1.5 items-center">
          <button style={uiPlay(false,{padding:"6px 14px"})} onClick={()=>voz.res.notas.forEach((n,i)=>setTimeout(()=>playBand(CHROMATIC[n.pc],n.oct),i*45))}>▶ Tocar este voicing</button>
          <button style={uiPill(voz.solo,{padding:"6px 14px"})} onClick={()=>voz.setSolo(!voz.solo)}>{voz.solo?"Mostrando solo estas teclas":"Resaltar solo estas teclas"}</button>
          {voz.onMarcar && voz.res.notas.length>0 && <button style={uiMarcar(false)} onClick={voz.onMarcar} title="Pasa estas notas a Notas marcadas, para escucharlas y modificarlas sobre el teclado">◎ Marcar estas teclas</button>}
        </div>
        <p style={{fontSize:10.5,color:"#6a6a70",margin:"8px 0 0",lineHeight:1.5}}>
          {voz.mano==="izq" ? "Mano izquierda: el bajo es la fundamental (de preferencia en la octava 2) y arriba va un relleno cerrado desde el Re4, sin la quinta cuando hay séptima o sexta. Ejemplos: Do△7 = Do2 + Mi + Si; Sol7 = Sol2 + Fa + Si; Do = Do2 + Mi + Sol + Do. La inversión cambia qué nota del relleno va abajo."
                            : "Mano derecha: las notas del acorde de abajo hacia arriba desde el Do3. Cada inversión pone una nota distinta en la base."}
        </p>
      </>)}
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
