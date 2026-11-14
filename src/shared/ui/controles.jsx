// Controles comunes: panel de notas marcadas y grupos.

import { RAIZ_NOM, analizarAcorde } from "../teoria/cifrado.js";
import { txtSobre } from "../teoria/etiquetas.js";
import { CHROMATIC, nombreLat } from "../teoria/notas.js";
import { nc } from "../teoria/color.js";
import { UI_FONT, uiGhost, uiLabel, uiPlay } from "./tema.js";
import { playBandDur } from "../audio/audio.js";

export function PanelMarcadas({marcadas,marcar,onRemove,onClear}){
  const orden=[...marcadas].sort((a,b)=>a.midi-b.midi||a.orden-b.orden);
  const prim=[...marcadas].sort((x,y)=>x.orden-y.orden)[0];
  const an=orden.length>=2?analizarAcorde(orden.map(m=>m.pc),orden[0].pc,{raiz:prim?prim.pc:null}):null;
  const acorde=an?an.nombre:null;
  const nombre=(m)=>(an&&an.nombres&&an.nombres[m.pc])||nombreLat(RAIZ_NOM[m.pc]);
  const tocar=(arp)=>orden.forEach((m,i)=>playBandDur(CHROMATIC[m.pc],m.oct,arp?0.38:1.8,arp?i*0.32:i*0.012));
  return(
    <div style={{background:"#121214",border:"1px solid #26262a",borderRadius:12,padding:"12px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:8,flexWrap:"wrap",marginBottom:8}}>
        <p style={{...uiLabel,margin:0}}>◎ Notas marcadas</p>
        <span style={{fontFamily:UI_FONT,fontSize:11,color:marcar?"#ececec":"#7c7c82"}}>{marcar?"Marcar activo: tocá una tecla para agregarla o sacarla":"Activá Marcar (arriba) para elegir notas sobre el teclado"}</span>
      </div>
      {orden.length===0
        ? <p style={{fontFamily:UI_FONT,fontSize:12,color:"#7c7c82",margin:"4px 0 2px",lineHeight:1.5}}>Todavía no marcaste ninguna nota. Marcá varias teclas para armar un acorde y escucharlo completo.</p>
        : <>
            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:10}}>
              {orden.map(m=>{ const col=nc(CHROMATIC[m.pc]); return(
                <button key={m.id} onClick={()=>onRemove(m.id)} title="Sacar esta nota"
                  style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 8px 4px 5px",borderRadius:999,cursor:"pointer",background:"#0e0e10",border:"1px solid #2c2c30",color:"#ececec",fontFamily:UI_FONT}}>
                  <span style={{width:24,height:24,borderRadius:"50%",background:col,color:txtSobre(col),display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,fontFamily:"monospace"}}>{m.orden}</span>
                  <span style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:13}}>{nombre(m)}{m.oct}</span>
                  <span style={{fontSize:9.5,color:"#7c7c82"}}>{m.mano}</span>
                  <span style={{fontSize:12,color:"#8a8a90"}}>✕</span>
                </button>);})}
            </div>
            <p style={{fontFamily:UI_FONT,fontSize:13,color:"#ececec",margin:"0 0 10px"}}>
              <span style={{...uiLabel,marginRight:8}}>Acorde</span>
              <b style={{fontFamily:"'Libre Baskerville',serif",fontSize:16}}>{acorde||"—"}</b>
            </p>
          </>}
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        <button disabled={!orden.length} style={uiPlay(false,{padding:"7px 14px"})} onClick={()=>tocar(false)}>▶ Escuchar acorde</button>
        <button disabled={!orden.length} style={uiPlay(false,{padding:"7px 14px"})} onClick={()=>tocar(true)}>▶ Arpegio</button>
        <button disabled={!orden.length} style={{...uiGhost,marginLeft:"auto"}} onClick={onClear}>⟳ Limpiar</button>
      </div>
    </div>
  );
}

export const segS={display:"flex",background:"#121214",border:"1px solid #2c2c30",borderRadius:10,padding:3,gap:2};

export function GrupoCtl({t,children}){ return(<div><p style={{...uiLabel,fontSize:9,letterSpacing:"0.16em",margin:"0 0 4px 2px"}}>{t}</p>{children}</div>); }
