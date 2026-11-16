// La hoja de color: el menú chico de los 12 colores, anclado a la tecla tocada.
// Vivía en features/codigo (fase 3) y subió a shared/ en la fase 6: la usan
// El Código y el Entrenador, y un feature no importa de otro (regla 2).
import { useEffect } from "react";
import { CHROMATIC } from "../teoria/notas.js";
import { nc } from "../teoria/color.js";
import { CROM_SIMPLE } from "../teoria/etiquetas.js";

// Menú de color chico, anclado a la tecla tocada (no tapa la página ni la oscurece)
export function HojaDeColor({ rect, actual, onPick, onErase, onClose }){
  const PW=244, PH=158, M=8;
  const vw=window.innerWidth, vh=window.innerHeight;
  const cx=rect.left+rect.width/2;
  const left=Math.min(Math.max(cx-PW/2,M), vw-PW-M);
  const arriba = rect.top-M >= PH+10;
  let top = arriba ? rect.top-PH-10 : rect.bottom+10;
  top=Math.min(Math.max(top,M), vh-PH-M);
  const arrowLeft=Math.min(Math.max(cx-left,18), PW-18);

  useEffect(()=>{
    const close=()=>onClose();
    const key=(e)=>{ if(e.key==="Escape") onClose(); };
    window.addEventListener("scroll",close,true);
    window.addEventListener("resize",close);
    window.addEventListener("keydown",key);
    return ()=>{
      window.removeEventListener("scroll",close,true);
      window.removeEventListener("resize",close);
      window.removeEventListener("keydown",key);
    };
  },[onClose]);

  return (
    <div style={{position:"fixed",inset:0,zIndex:1000}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{position:"fixed",left,top,width:PW,background:"#121212",border:"1.5px solid #e6e6e6",borderRadius:12,
          padding:"10px 10px 8px",boxShadow:"0 10px 30px rgba(0,0,0,.65)"}}>
        <div style={{position:"absolute",left:arrowLeft-6,[arriba?"bottom":"top"]:-7,width:12,height:12,background:"#121212",
          borderRight:arriba?"1.5px solid #e6e6e6":"none",borderBottom:arriba?"1.5px solid #e6e6e6":"none",
          borderLeft:arriba?"none":"1.5px solid #e6e6e6",borderTop:arriba?"none":"1.5px solid #e6e6e6",
          transform:"rotate(45deg)"}}/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:"6px 4px",marginBottom:8}}>
          {CHROMATIC.map(n=>{
            const sel = actual===nc(n);
            return(
              <button key={n} onClick={()=>onPick(nc(n))}
                style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:0,background:"none",border:"none",cursor:"pointer"}}>
                <span style={{display:"block",width:30,height:30,borderRadius:"50%",background:nc(n),
                  border:sel?"3px solid #fff":"2px solid rgba(255,255,255,.22)"}}/>
                <span style={{fontSize:9,color:sel?"#e6e6e6":"#aaa",fontFamily:"monospace"}}>{CROM_SIMPLE[n]}</span>
              </button>
            );
          })}
        </div>
        <div style={{display:"flex",gap:6}}>
          <button onClick={onErase} style={{flex:1,padding:"5px",borderRadius:8,border:"1px solid #5c2d2d",background:"#1f0a0a",color:"#d98f88",fontWeight:700,fontSize:11,cursor:"pointer"}}>🗑 Borrar</button>
          <button onClick={onClose} style={{flex:1,padding:"5px",borderRadius:8,border:"1px solid #2a2a2a",background:"transparent",color:"#8a8a8a",fontSize:11,cursor:"pointer"}}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}
