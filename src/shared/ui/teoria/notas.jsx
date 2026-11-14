// Nota = círculo con el color de la nota y su nombre; TensionChip = etiqueta + círculo.

import { nc } from "../../teoria/color.js";
import { UI_FONT } from "../tema.js";
import { playTone } from "../../audio/audio.js";

// Nota = círculo con el color de la nota y su nombre en blanco (sin recuadros ni resplandor)
export const fmtNota=(t)=>String(t).replace(/[0-9]/g,"").replace(/^([A-G])(.*)$/,(m,l,r)=>l+r.replace(/##/g,"𝄪").replace(/#/g,"♯").replace(/bb/g,"♭♭").replace(/b/g,"♭"));

export const NotaDot=({note,size=24,onClick,title})=>{
  const color=nc(note), t=fmtNota(note);
  const fs=Math.round(size*(t.length>2?0.36:t.length>1?0.43:0.52));
  return(
    <span title={title||t} onClick={onClick===undefined?()=>playTone(note,4,0.6):onClick}
      style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:size,height:size,borderRadius:"50%",background:color,color:"#fff",
        fontWeight:800,fontSize:fs,fontFamily:UI_FONT,lineHeight:1,letterSpacing:"-0.02em",flexShrink:0,cursor:"pointer",
        textShadow:"0 1px 2px rgba(0,0,0,.9), 0 0 3px rgba(0,0,0,.55)",boxShadow:"inset 0 0 0 1.5px rgba(255,255,255,.3)"}}>{t}</span>
  );
};

export const Nota=({note,size="md"})=><NotaDot note={note} size={{sm:22,md:28,lg:38}[size]||28}/>;

// Tensión / nota a evitar: etiqueta + círculo de color (tipo "ok" verde, "no" rojo)
export const TensionChip=({label,note,tipo="ok"})=>(
  <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"2px 7px 2px 8px",borderRadius:999,whiteSpace:"nowrap",
    border:`1px solid ${tipo==="ok"?"#2d5c2d":"#5c2d2d"}`,background:"#0f0f10"}}>
    <span style={{fontFamily:"monospace",fontWeight:800,fontSize:11,color:tipo==="ok"?"#7fcf7f":"#d98a8a"}}>{label}</span>
    {note ? <NotaDot note={note} size={20}/> : null}
  </span>
);
