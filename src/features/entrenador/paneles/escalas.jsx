// El panel del modo Escalas · Practicar: la guía, la fila coloreada y el progreso (fase 6, movido tal cual).

import { CHROMATIC } from "../../../shared/teoria/notas.js";
import { nc } from "../../../shared/teoria/color.js";
import { uiPill, uiPlay } from "../../../shared/ui/tema.js";
import { Desplegable } from "../../../shared/ui/ayudas.jsx";
import { CROM_SIMPLE, txtSobre } from "../../../shared/teoria/etiquetas.js";

export function PanelEscalas({ dedos, escCab, escDeletreo, escDir, escEscuchar, escMano, escModo, escR, etiqueta, gradoTxt, prog, romano, setEscDir, setEscMano, setEscModo, setEscStart, setProg, setRomano, verDedo }) {
  return (
    <div className="rounded-xl mb-3" style={{background:"#121212",border:"1px solid #2a2a2a",padding:"12px 14px"}}>
          <p className="text-xs text-gray-500 mb-3">Con la guía, el teclado te muestra la escala nota por nota, con su octava real y su color. De memoria, la tocás vos y el color aparece cuando acertás. Usá el botón Abre / Cierra de arriba para cambiar el sentido del fuelle.</p>
          {escCab}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:12}}>
            <Desplegable etiqueta="Mano" valor={escMano} opciones={[["der","Derecha"],["izq","Izquierda"]]} onChange={v=>{setEscMano(v);setEscStart(-1);}}/>
            <Desplegable etiqueta="Sentido" valor={escDir} opciones={[["sube","↑ Sube"],["baja","↓ Baja"]]} onChange={v=>{setEscDir(v);setEscStart(-1);}}/>
            {escR.tonics.length>1 && <Desplegable etiqueta="Empezar en" valor={escR.startUsed} opciones={escR.tonics.map((t,i)=>[i,etiqueta(t)])} onChange={v=>setEscStart(Number(v))}/>}
            <Desplegable etiqueta="Cómo" valor={escModo} opciones={[["ver","👁 Con la guía"],["practica","✋ De memoria"]]} onChange={setEscModo}/>
            <Desplegable etiqueta="Función" valor={romano?"rom":"num"} opciones={[["rom","I · II · III"],["num","1 · 2 · 3"]]} onChange={v=>setRomano(v==="rom")}/>
          </div>
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <button style={uiPlay(false,{padding:"7px 16px"})} onClick={escEscuchar}>▶ Escuchar</button>
            {escModo==="practica" && <button style={uiPill(prog.hint,{padding:"7px 16px"})} onClick={()=>setProg(p=>({...p,hint:!p.hint}))}>💡 Pista</button>}
          </div>
          {/* fila coloreada sugerida */}
          <div style={{display:"flex",gap:6}}>
            {escR.route.map((r,i)=>{ const col=nc(CHROMATIC[r.item.pc]); const hecho = escModo==="ver" || i<prog.i; return(
              <div key={i} style={{flex:"1 1 0",minWidth:0,borderRadius:10,padding:"7px 2px",textAlign:"center",cursor:"default",background:hecho?col:"#161616",border:`2px solid ${hecho?"rgba(255,255,255,.35)":"#2a2a2a"}`,color:hecho?txtSobre(col):"#555",transition:"background .2s"}}>
                <div style={{fontSize:10,fontWeight:800,fontFamily:"monospace",opacity:.85}}>{gradoTxt(r,i)}</div>
                <div style={{fontSize:13,fontWeight:900,fontFamily:"serif"}}>{hecho?etiqueta(r.item):"?"}</div>
                <div style={{marginTop:3,minHeight:16,fontSize:11,fontWeight:900,fontFamily:"monospace",opacity:.9}}>{verDedo(i)?(dedos[i]?("☝"+dedos[i]):"·"):""}</div>
              </div>);})}
          </div>
          <p style={{fontSize:11,color:"#8a8a8a",margin:"8px 0 0"}}>
            {dedos.some(x=>x) ? "Dedos sugeridos (☝): 1 índice · 2 medio · 3 anular · 4 meñique. Con \"1/2\" podés usar cualquiera de los dos. Tocá una tecla para ver su octava y su dedo."
              : "Tocá una tecla del camino para ver su octava y su función. Los dedos aparecen cuando el ejercicio viene de una tarea de tu profesor."}
          </p>
          {escR.missing.length>0 && <p style={{fontSize:11.5,color:"#c9a25a",margin:"10px 0 0"}}>⚠ Con este fuelle y esta mano no hay {escR.missing.length>1?"notas":"una nota"} más arriba/abajo ({escR.missing.map(pc=>escDeletreo[pc]||CROM_SIMPLE[CHROMATIC[pc]]).join(", ")}). Probá el otro sentido del fuelle, la otra mano u otra octava de inicio.</p>}
          {escModo==="practica" && (
            <p style={{fontSize:13,margin:"10px 0 0",color:prog.i>=escR.route.length&&escR.route.length?"#6b9c7c":"#cfcfcf"}}>
              {prog.i>=escR.route.length&&escR.route.length ? `¡Escala completa! Errores: ${prog.err}` : `Tocá la nota ${prog.i+1} de ${escR.route.length}${prog.err?` · errores: ${prog.err}`:""}`}
            </p>)}
        </div>
  );
}
