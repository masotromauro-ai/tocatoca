// El panel de Armar acordes · Libre: tocar botones, nombrar el acorde, formas sugeridas y mis nombres (fase 6, movido tal cual).

import { CHROMATIC, nombreLat } from "../../../shared/teoria/notas.js";
import { CLAVES } from "../../../shared/claves.js";
import { nc } from "../../../shared/teoria/color.js";
import { UI_FONT, inpS, uiGhost, uiLabel, uiPill, uiPlay, uiTool } from "../../../shared/ui/tema.js";
import { cifEstilo, cifGuardarPropios, cifPropios } from "../../../shared/almacen/preferencias.js";
import { RAIZ_NOM } from "../../../shared/teoria/cifrado.js";
import { Desplegable } from "../../../shared/ui/ayudas.jsx";
import { CROM_SIMPLE, txtSobre } from "../../../shared/teoria/etiquetas.js";

export function PanelConstruir({ acoVistas, armarToggle, bellows, cardGuardar, conAn, conCopiar, conGuardar, conIds, conItems, conMsg, conNota, conPrimera, conQuitar, conRaiz, conTocar, conTxt, conVoicings, formasUI, guardarVoicing, setBellows, setConNota, setConRaiz, setConSel, setConTxt, setConVer, tocarVoicing }) {
  return (
    (()=>{
        const orden=[...conItems].sort((a,b)=>a.midi-b.midi||a.orden-b.orden), propios=cifPropios(), claves=Object.keys(propios);
        const ejC=(k)=>k.split(",").map(n=>CROM_SIMPLE[CHROMATIC[Number(n)%12]]).join(" · ");
        return (
        <div className="rounded-xl mb-3" style={{background:"#121212",border:"1px solid #2a2a2a",padding:"12px 14px"}}>
          {acoVistas}
          {armarToggle}
          <p className="text-xs text-gray-500" style={{margin:"0 0 12px"}}>Tocá los botones de cualquier mano para armar el acorde. La primera nota que marcás es la raíz; después sumá las que quieras, en cualquier orden, repetidas en otras octavas o con tensiones. Tocá una nota marcada para sacarla.</p>
          <div style={{padding:"10px 12px",borderRadius:12,background:"#0e0e10",border:"1px solid #26262a",marginBottom:10}}>
            <p style={{...uiLabel,margin:"0 0 4px"}}>Acorde</p>
            <p style={{margin:0,fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:22,color:"#ececec"}}>
              {conAn?conAn.nombre:(conItems.length===0?"—":"Marcá otra nota")}
              {conAn&&conAn.custom&&<span style={{marginLeft:8,fontFamily:UI_FONT,fontSize:10,fontWeight:700,color:"#8a8a8a",border:"1px solid #3a3a3e",borderRadius:6,padding:"1px 6px",verticalAlign:"middle"}}>mi nombre</span>}
            </p>
            {conAn&&!conAn.intervalo&&conAn.alts.length>0 && (
              <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center",marginTop:8}}>
                <span style={{fontSize:11,color:"#8a8a8a"}}>También se puede leer como:</span>
                {conAn.alts.map(x=>(<button key={x.nombre} style={uiPill(false,{padding:"3px 10px",fontSize:11})} onClick={()=>setConRaiz(x.rootPc)}>{x.nombre}</button>))}
                {conRaiz!=null&&conRaiz!==conPrimera&&<button style={uiPill(false,{padding:"3px 10px",fontSize:11})} onClick={()=>setConRaiz(null)}>↺ Raíz = primera nota</button>}
              </div>)}
          </div>
          {orden.length>0 && (
            <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:10}}>
              {orden.map(it=>{ const col=nc(CHROMATIC[it.pc]), gr=conAn&&conAn.grados[(it.pc-conAn.rootPc+12)%12]; return (
                <button key={it.b.id} onClick={()=>conQuitar(it.b.id)} title="Sacar esta nota" style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 8px 4px 5px",borderRadius:999,cursor:"pointer",background:"#0e0e10",border:"1px solid #2c2c30",color:"#ececec"}}>
                  <span style={{minWidth:24,height:24,padding:"0 4px",borderRadius:12,background:col,color:txtSobre(col),display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,fontFamily:"monospace"}}>{gr||it.orden}</span>
                  <span style={{fontFamily:"'Libre Baskerville',serif",fontWeight:700,fontSize:13}}>{(conAn&&conAn.nombres&&conAn.nombres[it.pc])||nombreLat(RAIZ_NOM[it.pc])}{it.oct}</span>
                  <span style={{fontSize:9.5,color:"#7c7c82"}}>{it.mano}</span><span style={{fontSize:12,color:"#8a8a90"}}>✕</span>
                </button>); })}
            </div>)}
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:4}}>
            <button disabled={!orden.length} style={uiPlay(false,{padding:"7px 14px"})} onClick={()=>conTocar(false)}>▶ Escuchar acorde</button>
            <button disabled={!orden.length} style={uiPlay(false,{padding:"7px 14px"})} onClick={()=>conTocar(true)}>▶ Arpegio</button>
            <button disabled={!orden.length} style={uiGhost} onClick={()=>conIds.length&&conQuitar(conIds[conIds.length-1])}>↶ Quitar la última</button>
            <button disabled={!orden.length} style={{...uiGhost,marginLeft:"auto"}} onClick={()=>{setConSel(m=>({...m,[bellows]:[]}));setConRaiz(null);}}>⟳ Limpiar</button>
          </div>
          {conVoicings && (
            <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid #232326"}}>
              <p style={{...uiLabel,margin:"0 0 6px"}}>Formas sugeridas · {conAn.nombre}</p>
              {formasUI(conVoicings,{onVer:(v)=>{ setBellows(v.fuelle); setConSel(m=>({...m,[v.fuelle]:v.ids})); setConRaiz(null); tocarVoicing(v,false); },activoIds:conIds,btnVer:"Usar esta forma",guardar:(v)=>guardarVoicing(v,conAn.nombre+" · "+v.nombre)})}
              <p style={{fontSize:10.5,color:"#6a6a70",margin:"6px 0 0"}}>Usan la raíz, la 3ª, la 5ª y la 7ª (si la tiene). Las demás notas las sumás vos tocando el teclado.</p>
            </div>)}
          {conItems.length>=3 && conAn && !conAn.intervalo && !conVoicings && <p style={{fontSize:11,color:"#7c7c82",margin:"10px 0 0"}}>Para sugerir formas, el acorde necesita raíz, 3ª y 5ª.</p>}
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginTop:10}}>
            <input value={conNota} onChange={e=>setConNota(e.target.value)} placeholder="Anotación opcional (ej.: marcato, mano izquierda)" style={{...inpS,flex:"1 1 220px",fontSize:12,padding:"6px 8px"}}/>
            <button disabled={orden.length<2} style={uiTool(false,{padding:"6px 12px",opacity:orden.length<2?0.45:1})} onClick={()=>{ cardGuardar(conAn?conAn.nombre:"Acorde",conNota,conIds,bellows,conAn&&conAn.nombres); setConNota(""); }}>★ Guardar en mis acordes</button>
          </div>
          <details style={{marginTop:12,borderTop:"1px solid #232326",paddingTop:10}}>
            <summary style={{cursor:"pointer",fontFamily:UI_FONT,fontSize:12,fontWeight:600,color:"#cfcfd4"}}>Nombres: cómo se escribe y nombres propios</summary>
            <div style={{marginTop:10}}>
              <p style={{fontSize:11.5,color:"#8a8a8a",margin:"0 0 10px",lineHeight:1.5}}>El nombre sale de las notas que armaste: tercera, quinta, séptima, tensiones y alteraciones. Si preferís otra forma de escribirlo para este acorde, cambiala acá y se guarda para esa estructura en todas las tonalidades.</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,marginBottom:10}}>
                <Desplegable etiqueta="Estilo de cifrado" valor={cifEstilo()} opciones={[["jazz","△7 · m7 · ø7 · °7"],["amer","maj7 · m7 · m7♭5 · dim7"]]} onChange={v=>{ try{localStorage.setItem(CLAVES.estiloCifrado,v);}catch(e){} setConVer(n=>n+1); }}/>
              </div>
              {conAn&&!conAn.intervalo ? (
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-end",marginBottom:6}}>
                  <label style={{display:"flex",flexDirection:"column",gap:5,flex:"1 1 200px"}}>
                    <span style={uiLabel}>Escritura de este acorde (después de la raíz)</span>
                    <input value={conTxt} onChange={e=>setConTxt(e.target.value)} placeholder={conAn.defaultSuf||"mayor"} style={{...inpS,fontFamily:"monospace",fontSize:13}}/>
                  </label>
                  <button style={uiPill(true,{padding:"8px 14px"})} onClick={conGuardar}>Guardar mi nombre</button>
                </div>) : <p style={{fontSize:11.5,color:"#6a6a70",margin:"0 0 6px"}}>Armá un acorde de tres notas o más para poder ponerle tu propio nombre.</p>}
              {conMsg&&<p style={{fontSize:11.5,color:"#8a8a8a",margin:"4px 0 8px"}}>{conMsg}</p>}
              {claves.length>0 && (
                <div style={{marginTop:8}}>
                  <p style={{...uiLabel,margin:"0 0 6px"}}>Mis nombres guardados</p>
                  {claves.map(k=>(
                    <div key={k} style={{display:"flex",gap:8,alignItems:"center",padding:"4px 0",borderTop:"1px solid #1c1c1f",fontSize:12,color:"#cfcfd4"}}>
                      <b style={{minWidth:70}}>Do {propios[k]}</b><span style={{color:"#7c7c82",flex:1}}>{ejC(k)}</span>
                      <button style={uiPill(false,{padding:"2px 9px",fontSize:11})} onClick={()=>{ const p={...cifPropios()}; delete p[k]; cifGuardarPropios(p); setConVer(v=>v+1); }}>Borrar</button>
                    </div>))}
                  <button style={uiPill(false,{padding:"6px 14px",marginTop:8})} onClick={conCopiar}>⧉ Copiar mis nombres</button>
                </div>)}
            </div>
          </details>
        </div>);
      })()
  );
}
