// La pestaña Colores.

import { useState } from "react";
import { useRomanos } from "../../../shared/almacen/romanos.js";
import { ESCALAS_HERO, NOMBRES_PC } from "../../../shared/ui/codigo/paleta.jsx";
import { tocarNombres } from "../../../shared/audio/tocar.js";
import { VistaCircular, VistaEspiral, VistaLineal } from "../modos/ModosTab.jsx";
import { CHROMATIC, buildScale, nombreLat } from "../../../shared/teoria/notas.js";
import { nc } from "../../../shared/teoria/color.js";
import { uiLabel, uiPill, uiPlay } from "../../../shared/ui/tema.js";
import { playBand } from "../../../shared/audio/audio.js";
import { ACORDE_RAICES } from "../../../shared/bandoneon/acordes-base.js";

export function ColoresTab(){
  const [root,setRoot]=useState("C");
  const [escId,setEscId]=useState("mayor");
  const [forma,setForma]=useState("circular");
  const [romano]=useRomanos();
  const esc=ESCALAS_HERO.find(e=>e.id===escId);
  const escritas=buildScale(root,esc.ivs);
  const FORMAS=[["lineal","▭ Lineal"],["circular","◯ Circular"],["espiral","◎ Espiral"]];
  const DESC={lineal:"Los semitonos en fila, de la tónica a la octava, con la distancia (T tono, S semitono) entre las notas de la escala.",
              circular:"Los doce colores en círculo: la escala dibuja una figura, siempre la misma forma en cualquier tonalidad.",
              espiral:"La altura crece a medida que se sube: cada vuelta es una octava y la tónica queda siempre arriba."};
  const card={background:"#121214",border:"1px solid #26262a",borderRadius:14,padding:"14px"};
  return(
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1" style={{fontFamily:"'Libre Baskerville',serif"}}>Colores</h2>
        <p className="text-xs text-gray-500">Una escala, tres maneras de verla. Elegí tonalidad y escala; tocá cualquier color para escucharlo.</p>
      </div>
      <div style={{...card,marginBottom:12}}>
        <p style={{...uiLabel,marginBottom:8}}>Tonalidad</p>
        <div className="flex flex-wrap gap-1.5 mb-3">{ACORDE_RAICES.map(x=>(<button key={x} style={uiPill(root===x,{padding:"5px 11px"})} onClick={()=>setRoot(x)}>{nombreLat(x)}</button>))}</div>
        <p style={{...uiLabel,marginBottom:8}}>Escala</p>
        <div className="flex flex-wrap gap-1.5">{ESCALAS_HERO.map(e=>(<button key={e.id} style={uiPill(escId===e.id,{padding:"5px 11px"})} onClick={()=>setEscId(e.id)}>{e.corto}</button>))}</div>
      </div>

      <div style={card}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex gap-1.5">{FORMAS.map(([v,l])=>(<button key={v} style={uiPill(forma===v,{padding:"6px 14px"})} onClick={()=>setForma(v)}>{l}</button>))}</div>
          <button style={uiPlay(false,{padding:"6px 14px"})} onClick={()=>tocarNombres([...escritas,escritas[0]])}>▶ Tocar escala</button>
        </div>
        <p style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:15,margin:"6px 0 2px"}}>{nombreLat(root)} {esc.nombre}</p>
        <p style={{fontSize:11.5,color:"#8a8a90",margin:"0 0 10px"}}>{escritas.map(nombreLat).join(" · ")} — {DESC[forma]}</p>
        <div style={{maxWidth:forma==="lineal"?"100%":(forma==="espiral"?400:360),margin:"0 auto"}}>
          {forma==="lineal" && <VistaLineal root={root} esc={esc} romano={romano}/>}
          {forma==="circular" && <VistaCircular root={root} esc={esc} romano={romano}/>}
          {forma==="espiral" && <VistaEspiral root={root} esc={esc}/>}
        </div>
      </div>

      {/* referencia: la paleta */}
      <div style={{...card,marginTop:12}}>
        <p style={{...uiLabel,marginBottom:10}}>Paleta de referencia</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"10px 6px"}}>
          {[...Array(12).keys()].map(pc=>(
            <button key={pc} onClick={()=>playBand(CHROMATIC[pc],4)} style={{background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{width:34,height:34,borderRadius:"50%",background:nc(CHROMATIC[pc]),border:"2px solid rgba(255,255,255,.3)",display:"block"}}/>
              <span style={{fontSize:10.5,color:"#cfcfd4",fontFamily:"'Libre Baskerville',serif",fontWeight:700}}>{NOMBRES_PC[pc].replace(" / ","/")}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
