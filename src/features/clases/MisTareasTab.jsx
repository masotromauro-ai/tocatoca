// La pestaña Mis tareas.

import { useState, useEffect } from "react";
import { aRomano } from "../../shared/teoria/romanos.js";
import { useRomanos } from "../../shared/almacen/romanos.js";
import { descEj, fmtHz } from "./org.jsx";
import { CHROMATIC } from "../../shared/teoria/notas.js";
import { nc } from "../../shared/teoria/color.js";
import { uiPill, uiPlay } from "../../shared/ui/tema.js";
import { txtSobre } from "../../shared/teoria/etiquetas.js";
import { CLAVES } from "../../shared/claves.js";

export function MisTareasTab({onPracticar}){
  const u = window.__USUARIO || "";
  const [romano]=useRomanos();
  const [datos,setDatos]=useState(null), [err,setErr]=useState(false);
  const [hechas,setHechas]=useState(()=>{ try{ return JSON.parse(localStorage.getItem(CLAVES.hechas+u)||"{}"); }catch(e){ return {}; } });
  useEffect(()=>{ let vivo=true;
    fetch("clases.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(j=>{ if(!vivo) return; if(j&&Array.isArray(j.clases)) setDatos(j); else setErr(true); }).catch(()=>{ if(vivo) setErr(true); });
    return ()=>{vivo=false;}; },[]);
  const marcar=(id)=>{ const n={...hechas,[id]:!hechas[id]}; setHechas(n); try{ localStorage.setItem(CLAVES.hechas+u,JSON.stringify(n)); }catch(e){} };
  const ids = (()=>{ if(!datos||!datos.asignaciones) return []; const out=[];
    Object.entries(datos.asignaciones).forEach(([k,l])=>{ if(k.trim().toLowerCase()===u.trim().toLowerCase()) (l||[]).forEach(id=>{ if(!out.includes(id)) out.push(id); }); });
    return out; })();
  const clases = datos ? ids.map(id=>datos.clases.find(c=>c.id===id)).filter(Boolean) : [];
  const card={background:"#121212",border:"1px solid #2a2a2a",borderRadius:12,padding:"12px 14px",marginBottom:12};
  return(
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1" style={{fontFamily:"'Libre Baskerville',serif"}}>Mis tareas</h2>
        <p className="text-xs text-gray-500">{u ? `Tareas de ${u}. ` : ""}Tocá "Practicar" para abrir el ejercicio ya preparado en el Entrenador, con sus notas, octavas y dedos.</p>
      </div>
      {!datos && !err && <p style={{fontSize:13,color:"#8a8a8a"}}>Cargando…</p>}
      {err && <div style={card}><p style={{fontSize:13,margin:0,color:"#a0a0a6"}}>Todavía no hay tareas publicadas.</p></div>}
      {datos && clases.length===0 && <div style={card}><p style={{fontSize:13,margin:0,color:"#a0a0a6"}}>Todavía no tenés tareas asignadas.</p>{u && <p style={{fontSize:11.5,margin:"8px 0 0",color:"#6a6a6a"}}>Entraste como <b>{u}</b>. Si esperabas tareas, pasale este nombre a tu profesor.</p>}</div>}
      {clases.map(c=>(
        <div key={c.id} style={card}>
          <div style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:16}}>{c.nombre}</div>
          {c.titulo && <div style={{fontSize:13,color:"#a0a0a6",margin:"2px 0 8px"}}>{c.titulo}</div>}
          {c.ejercicios.map((e,k)=>(
            <div key={e.id} style={{padding:"8px 0",borderTop:"1px solid #1c1c1f"}}>
              <div className="flex flex-wrap gap-2 items-center">
                <span style={{flex:"1 1 240px",fontSize:13,opacity:hechas[e.id]?0.5:1,textDecoration:hechas[e.id]?"line-through":"none"}}><b style={{color:"#8a8a8a",marginRight:6}}>{k+1}.</b>{descEj(e)}</span>
                {e.tipo!=="texto" && <button style={uiPlay(false,{padding:"6px 14px"})} onClick={()=>onPracticar(e)}>▶ Practicar</button>}
                <button style={uiPill(!!hechas[e.id],{padding:"6px 12px"})} onClick={()=>marcar(e.id)}>{hechas[e.id]?"✓ Hecha":"Marcar hecha"}</button>
              </div>
              {e.ruta && (
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
                  {e.ruta.map((p,i)=>{ const col=nc(CHROMATIC[p.pc]); return(
                    <div key={i} title={`${fmtHz(p.hz)} Hz · tecla ${p.b}`} style={{background:col,color:txtSobre(col),borderRadius:9,padding:"5px 9px",textAlign:"center",minWidth:58,border:"1.5px solid rgba(255,255,255,.3)"}}>
                      <div style={{fontSize:9.5,fontWeight:800,fontFamily:"monospace",opacity:.85}}>{romano?aRomano(p.g):p.g}</div>
                      <div style={{fontSize:13,fontWeight:900,fontFamily:"serif"}}>{p.n}</div>
                      <div style={{fontSize:9,fontFamily:"monospace",opacity:.85}}>{fmtHz(p.hz)} Hz</div>
                      <div style={{fontSize:11,fontWeight:900,fontFamily:"monospace",minHeight:15}}>{p.d?("☝"+p.d):""}</div>
                    </div>); })}
                </div>
              )}
              {e.indic && <div style={{fontSize:12.5,color:"#cfcfcf",marginTop:8,whiteSpace:"pre-wrap"}}>📝 {e.indic}</div>}
            </div>
          ))}
        </div>
      ))}
      <p style={{fontSize:11,color:"#6a6a6a"}}>Lo que marcás como hecho se guarda solo en este dispositivo; tu profesor no lo ve.</p>
    </div>
  );
}
