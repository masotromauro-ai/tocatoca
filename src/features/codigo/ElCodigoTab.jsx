// La pestaña El Código.

import { useState } from "react";
import { PaletaRueda } from "../../shared/ui/codigo/paleta.jsx";
import { EntrenaColores } from "./entrena.jsx";
import { CAPITULOS, CAPITULOS_TEC } from "./capitulos.jsx";
import { UI_FONT, uiLabel, uiPill } from "../../shared/ui/tema.js";

// ─── Componente de la pestaña "El Código" ────────────────────────────────────
export function ElCodigoTab({irA,completo=false}={}){
  const [vista, setVista] = useState("metodo");   // metodo | entrenar
  const [capIdx, setCapIdx] = useState(0);
  const CAPS = completo ? CAPITULOS : CAPITULOS_TEC;
  const cap = CAPS[capIdx];
  const partes = [...new Set(CAPS.map(c=>c.parte))];

  return(
    <div className="stagger">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1" style={{fontFamily:"'Libre Baskerville',serif"}}>
          {completo?"📖 Manual completo — El Código":"📖 El Código"}
        </h2>
        <p className="text-xs text-gray-500">{completo?"Versión completa del manual: solo la ves vos desde el Organizador.":"Cómo llegamos a la distribución de los doce colores y el temperamento cromático."}</p>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4" style={{background:"#101012",border:"1px solid #26262a",borderRadius:12,padding:4,width:"fit-content"}}>
        {[["metodo","📖 El método"],["entrenar","🎯 Entrenar los colores"]].map(([v,l])=>(<button key={v} style={uiPill(vista===v,{padding:"7px 16px"})} onClick={()=>setVista(v)}>{l}</button>))}
      </div>

      {vista==="entrenar" && (
        <div>
          <EntrenaColores/>
          <details style={{marginTop:14}}>
            <summary style={{cursor:"pointer",...uiLabel,padding:"6px 2px"}}>Ver la paleta para repasar</summary>
            <div style={{marginTop:10}}><PaletaRueda compacta/></div>
          </details>
        </div>
      )}
      {vista==="metodo" && <>
      {capIdx===0 && <PaletaRueda/>}

      {/* Selector de capítulo, agrupado por parte */}
      <select value={capIdx} onChange={e=>setCapIdx(parseInt(e.target.value))}
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-200 mb-4"
        style={{fontFamily:"monospace"}}>
        {partes.map(parte=>(
          <optgroup key={parte} label={parte}>
            {CAPS.map((c,i)=> c.parte===parte && (
              <option key={c.id} value={i}>{c.titulo}</option>
            ))}
          </optgroup>
        ))}
      </select>

      <div className="rounded-2xl p-5 border border-gray-700" style={{background:"#121212"}}>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{cap.parte}</p>
        <h3 className="text-lg font-bold mb-4" style={{fontFamily:"'Libre Baskerville',serif",color:"#e6e6e6"}}>{cap.titulo}</h3>
        {cap.body}
      </div>

      <div className="flex justify-between mt-4">
        <button disabled={capIdx===0} onClick={()=>setCapIdx(i=>Math.max(0,i-1))}
          className="px-4 py-2 rounded-xl text-sm border disabled:opacity-30"
          style={{background:"#1a1a1a",borderColor:"#333333",color:"#e6e6e6"}}>
          ← Anterior
        </button>
        <button disabled={capIdx===CAPS.length-1} onClick={()=>setCapIdx(i=>Math.min(CAPS.length-1,i+1))}
          className="px-4 py-2 rounded-xl text-sm border disabled:opacity-30"
          style={{background:"#1a1a1a",borderColor:"#333333",color:"#e6e6e6"}}>
          Siguiente →
        </button>
      </div>
      </>}

      {irA && (
        <div style={{marginTop:22,background:"#121214",border:"1px solid #26262a",borderRadius:14,padding:"16px 14px"}}>
          <p style={{...uiLabel,marginBottom:10}}>Siguiente paso · a tocar</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:10}}>
            {[["bandoneon","♬","Bandoneón","El teclado coloreado, con su octava y tus acordes."],["entrenador","◎","Entrenador","Pintá teclas, armá acordes y practicá escalas."],[window.__ALUMNO?"tareas":"organizador",window.__ALUMNO?"✎":"▦",window.__ALUMNO?"Mis tareas":"Organizador",window.__ALUMNO?"Los ejercicios que te dejó tu profesor.":"Armá clases y asignalas a tus alumnos."]].map(([id,ic,t,d])=>(
              <button key={id} onClick={()=>irA(id)} style={{textAlign:"left",padding:"12px 14px",borderRadius:12,cursor:"pointer",background:"rgba(255,255,255,.02)",border:"1px solid #2e2e32",color:"#ececec"}}>
                <div style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:15}}>{ic} {t} →</div>
                <div style={{fontFamily:UI_FONT,fontSize:12,color:"#8a8a90",marginTop:3}}>{d}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

