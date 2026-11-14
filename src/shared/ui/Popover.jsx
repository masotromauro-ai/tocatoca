// Ventana chica anclada a una tecla.

import { useEffect } from "react";
import { UI_FONT } from "./tema.js";

// Ventana chica anclada a una tecla (no tapa ni oscurece la página)
export function PopoverAnclado({ rect, onClose, width=260, estimado=230, children }){
  const M=8, vw=window.innerWidth, vh=window.innerHeight;
  const cx=rect.left+rect.width/2;
  const left=Math.min(Math.max(cx-width/2,M), vw-width-M);
  const arriba = rect.top-M >= estimado+10;
  let top = arriba ? rect.top-estimado-10 : rect.bottom+10;
  top=Math.min(Math.max(top,M), vh-estimado-M);
  const flecha=Math.min(Math.max(cx-left,18), width-18);
  useEffect(()=>{
    const close=()=>onClose(); const key=(e)=>{ if(e.key==="Escape") onClose(); };
    window.addEventListener("scroll",close,true); window.addEventListener("resize",close); window.addEventListener("keydown",key);
    return ()=>{ window.removeEventListener("scroll",close,true); window.removeEventListener("resize",close); window.removeEventListener("keydown",key); };
  },[onClose]);
  return (
    <div style={{position:"fixed",inset:0,zIndex:1000}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{position:"fixed",left,top,width,background:"#131315",border:"1.5px solid #e6e6e6",borderRadius:12,padding:"12px 12px 10px",boxShadow:"0 10px 30px rgba(0,0,0,.65)",fontFamily:UI_FONT,color:"#ececec"}}>
        <div style={{position:"absolute",left:flecha-6,[arriba?"bottom":"top"]:-7,width:12,height:12,background:"#131315",
          borderRight:arriba?"1.5px solid #e6e6e6":"none",borderBottom:arriba?"1.5px solid #e6e6e6":"none",
          borderLeft:arriba?"none":"1.5px solid #e6e6e6",borderTop:arriba?"none":"1.5px solid #e6e6e6",transform:"rotate(45deg)"}}/>
        {children}
      </div>
    </div>
  );
}
